import { useEffect, useState } from "react"
import { discover, fetchAreas, fetchJob, fetchSubjects, warmupApi } from "./api"
import { DiscoveryScreen } from "./components/DiscoveryScreen"
import { HomeScreen } from "./components/HomeScreen"
import { JobDetailScreen } from "./components/JobDetailScreen"
import { LandingPage } from "./components/LandingPage"
import { TaneScreen } from "./components/TaneScreen"
import { ZukanScreen } from "./components/ZukanScreen"
import {
  addToZukan,
  hasRecordedToday,
  knownJobIds,
  loadState,
  recordStudyAndUpdateStreak,
  saveState,
  toggleTane,
  type AppState,
} from "./storage"
import type { DiscoverResponse, Job } from "./types"

type Screen = "top" | "home" | "discovery" | "zukan" | "tane" | "detail"

function App() {
  const [screen, setScreen] = useState<Screen>("top")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [appState, setAppState] = useState<AppState>(() => loadState())
  const [subjects, setSubjects] = useState<string[]>([])
  const [areaTotals, setAreaTotals] = useState<Record<string, number>>({})

  const [discoverResult, setDiscoverResult] = useState<DiscoverResponse | null>(null)
  const [discoverSubject, setDiscoverSubject] = useState("")

  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [detailReturnScreen, setDetailReturnScreen] = useState<"zukan" | "tane">("zukan")

  useEffect(() => {
    warmupApi()
    fetchSubjects()
      .then(setSubjects)
      .catch(() => setError("教科の一覧を取得できませんでした"))
    fetchAreas()
      .then(setAreaTotals)
      .catch(() => {
        // 図鑑画面に入るまで使わないので、ここでの失敗は致命的ではない
      })
  }, [])

  function updateAppState(next: AppState) {
    setAppState(next)
    saveState(next)
  }

  async function handleRecord(subject: string, minutes: number) {
    setLoading(true)
    setError(null)
    try {
      const result = await discover(subject, knownJobIds(appState))
      let next = recordStudyAndUpdateStreak(appState, minutes)
      if (result.job) {
        next = addToZukan(next, result.job.job_id, result.job.job_name, subject, result.job.area)
      }
      updateAppState(next)
      setDiscoverResult(result)
      setDiscoverSubject(subject)
      setScreen("discovery")
    } catch {
      setError("うまく見つけられませんでした。しばらくしてからもう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  function handleToggleTaneFor(jobId: number) {
    updateAppState(toggleTane(appState, jobId))
  }

  async function handleSelectJob(jobId: number, from: "zukan" | "tane") {
    setLoading(true)
    setError(null)
    try {
      const job = await fetchJob(jobId)
      setSelectedJob(job)
      setDetailReturnScreen(from)
      setScreen("detail")
    } catch {
      setError("職業情報を取得できませんでした。")
    } finally {
      setLoading(false)
    }
  }

  if (screen === "top") {
    return <LandingPage onStart={() => setScreen("home")} />
  }

  if (screen === "home") {
    return (
      <HomeScreen
        subjects={subjects}
        recordedToday={hasRecordedToday(appState)}
        streak={appState.streak}
        totalMinutes={appState.totalMinutes}
        zukanCount={appState.zukan.length}
        loading={loading}
        error={error}
        onRecord={handleRecord}
        onOpenZukan={() => setScreen("zukan")}
        onOpenTane={() => setScreen("tane")}
      />
    )
  }

  if (screen === "discovery" && discoverResult) {
    const jobId = discoverResult.job?.job_id
    return (
      <DiscoveryScreen
        job={discoverResult.job}
        exhausted={discoverResult.exhausted}
        subject={discoverSubject}
        isTane={jobId ? appState.taneIds.includes(jobId) : false}
        onToggleTane={() => jobId && handleToggleTaneFor(jobId)}
        onDone={() => setScreen("home")}
      />
    )
  }

  if (screen === "zukan") {
    return (
      <ZukanScreen
        zukan={appState.zukan}
        areaTotals={areaTotals}
        onBack={() => setScreen("home")}
        onSelectJob={(jobId) => handleSelectJob(jobId, "zukan")}
      />
    )
  }

  if (screen === "tane") {
    return (
      <TaneScreen
        zukan={appState.zukan}
        taneIds={appState.taneIds}
        onBack={() => setScreen("home")}
        onSelectJob={(jobId) => handleSelectJob(jobId, "tane")}
      />
    )
  }

  if (screen === "detail" && selectedJob) {
    const entry = appState.zukan.find((e) => e.jobId === selectedJob.job_id)
    return (
      <JobDetailScreen
        job={selectedJob}
        subject={entry?.subject}
        isTane={appState.taneIds.includes(selectedJob.job_id)}
        onToggleTane={() => handleToggleTaneFor(selectedJob.job_id)}
        onBack={() => setScreen(detailReturnScreen)}
      />
    )
  }

  return null
}

export default App
