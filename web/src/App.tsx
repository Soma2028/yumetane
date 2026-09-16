import { useEffect, useRef, useState } from "react"
import { discover, fetchAreas, fetchJob, fetchSubjects, warmupApi } from "./api"
import { DiscoveryScreen } from "./components/DiscoveryScreen"
import { HomeScreen } from "./components/HomeScreen"
import { JobDetailScreen } from "./components/JobDetailScreen"
import { KirokuScreen } from "./components/KirokuScreen"
import { LandingPage } from "./components/LandingPage"
import { TaneScreen } from "./components/TaneScreen"
import { ZukanScreen } from "./components/ZukanScreen"
import {
  addToZukan,
  knownJobIds,
  last7Dates,
  loadState,
  recordStudy,
  saveState,
  studiedDatesSet,
  subjectJobHistory,
  subjectTotals,
  todaysDiscoveredJobId,
  todaysLogs,
  todaysTotalMinutes,
  toggleTane,
  weeklySubjectTotals,
  weeklyTotalMinutes,
  type AppState,
  type RecordDetails,
} from "./storage"
import { stageFromCount } from "./taneStage"
import type { DiscoverResponse, Job, Subject } from "./types"

type Screen = "top" | "home" | "discovery" | "zukan" | "tane" | "detail" | "kiroku"
type DetailReturnScreen = "home" | "zukan" | "tane" | "kiroku"

function App() {
  const [screen, setScreen] = useState<Screen>("top")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [appState, setAppState] = useState<AppState>(() => loadState())
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [areaTotals, setAreaTotals] = useState<Record<string, number>>({})
  const specialSubjectNames = subjects.filter((s) => s.is_special).map((s) => s.name)

  const [discoverResult, setDiscoverResult] = useState<DiscoverResponse | null>(null)
  const [discoverSubject, setDiscoverSubject] = useState("")
  const [discoverZukanCount, setDiscoverZukanCount] = useState(0)
  const [discoverSpeechLines, setDiscoverSpeechLines] = useState<string[]>([])
  const [discoverAllDiscovered, setDiscoverAllDiscovered] = useState(false)
  const [discoverJustGrew, setDiscoverJustGrew] = useState(false)

  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [detailReturnScreen, setDetailReturnScreen] = useState<DetailReturnScreen>("home")

  const [homeToast, setHomeToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  async function handleRecord(subject: string, minutes: number, details: RecordDetails) {
    setError(null)

    if (specialSubjectNames.includes(subject)) {
      // 保健体育など: job tagに対応する知識項目が無いため、記録だけしてdiscoverは呼ばない
      updateAppState(recordStudy(appState, subject, minutes, null, details))
      if (toastTimer.current) clearTimeout(toastTimer.current)
      setHomeToast(`記録したよ！${subject}は今対応する職業データを準備中だよ`)
      toastTimer.current = setTimeout(() => setHomeToast(null), 3000)
      return
    }

    const hasDiscoverableRecordToday = todaysLogs(appState).some(
      (l) => !specialSubjectNames.includes(l.subject),
    )
    if (hasDiscoverableRecordToday) {
      // 2回目以降の記録：職業探索はせず、ログに積むだけ
      updateAppState(recordStudy(appState, subject, minutes, null, details))
      if (toastTimer.current) clearTimeout(toastTimer.current)
      setHomeToast("今日の発見はすみ。また明日一緒に探そう！")
      toastTimer.current = setTimeout(() => setHomeToast(null), 3000)
      return
    }

    setLoading(true)
    try {
      const result = await discover(subject, knownJobIds(appState))
      const discoveredJobId = result.job ? result.job.job_id : null
      let next = recordStudy(appState, subject, minutes, discoveredJobId, details)
      if (result.job) {
        next = addToZukan(
          next,
          result.job.job_id,
          result.job.job_name,
          subject,
          result.job.area,
          result.job.tags,
          result.job.description,
        )
      }
      updateAppState(next)

      const allDiscovered = next.zukan.length === 167 && result.job !== null
      const grew = stageFromCount(appState.zukan.length) !== stageFromCount(next.zukan.length)
      const lines: string[] = []
      if (allDiscovered) {
        lines.push("全部の仕事を見つけたよ！")
      } else if (result.job) {
        if (next.streak >= 3) lines.push(`${next.streak}日連続！すごいね`)
        lines.push(`${result.job.job_name}という仕事を見つけたよ！`)
      }

      setDiscoverResult(result)
      setDiscoverSubject(subject)
      setDiscoverZukanCount(next.zukan.length)
      setDiscoverSpeechLines(lines)
      setDiscoverAllDiscovered(allDiscovered)
      setDiscoverJustGrew(grew)
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

  async function handleSelectJob(jobId: number, from: DetailReturnScreen) {
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
    const discoveredId = todaysDiscoveredJobId(appState)
    const discoveredEntry = discoveredId != null ? appState.zukan.find((e) => e.jobId === discoveredId) : undefined
    const todaysDiscoveredJob = discoveredEntry
      ? { jobId: discoveredEntry.jobId, jobName: discoveredEntry.jobName }
      : null

    return (
      <HomeScreen
        subjects={subjects.map((s) => s.name)}
        todaysLogs={todaysLogs(appState)}
        todaysTotalMinutes={todaysTotalMinutes(appState)}
        streak={appState.streak}
        zukanCount={appState.zukan.length}
        todaysDiscoveredJob={todaysDiscoveredJob}
        toast={homeToast}
        loading={loading}
        error={error}
        weekDates={last7Dates()}
        studiedDates={studiedDatesSet(appState)}
        subjectTotals={subjectTotals(appState)}
        onRecord={handleRecord}
        onOpenZukan={() => setScreen("zukan")}
        onOpenTane={() => setScreen("tane")}
        onOpenKiroku={() => setScreen("kiroku")}
        onSelectJob={(jobId) => handleSelectJob(jobId, "home")}
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
        zukanCount={discoverZukanCount}
        speechLines={discoverSpeechLines}
        allDiscovered={discoverAllDiscovered}
        justGrew={discoverJustGrew}
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

  if (screen === "kiroku") {
    return (
      <KirokuScreen
        weeklyTotalMinutes={weeklyTotalMinutes(appState)}
        weeklySubjectTotals={weeklySubjectTotals(appState)}
        subjectJobHistory={subjectJobHistory(appState)}
        mostStudied={
          // 保健体育は職業に繋がらないため「ひとこと分析」の対象からは除く
          subjectTotals(appState).find((s) => !specialSubjectNames.includes(s.subject)) ?? null
        }
        specialSubjects={specialSubjectNames}
        onBack={() => setScreen("home")}
        onSelectJob={(jobId) => handleSelectJob(jobId, "kiroku")}
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
