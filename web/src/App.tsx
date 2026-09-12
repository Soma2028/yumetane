import { useEffect, useState } from "react"
import { fetchNextCard, fetchResult, warmupApi } from "./api"
import { JobDetailScreen } from "./components/JobDetailScreen"
import { MidResultScreen } from "./components/MidResultScreen"
import { ResultScreen } from "./components/ResultScreen"
import { SwipeScreen } from "./components/SwipeScreen"
import { TopScreen } from "./components/TopScreen"
import type { Job, RecommendResponse, SwipeDirection, SwipeEntry } from "./types"

type Screen = "top" | "swipe" | "midResult" | "result" | "detail"

const MID_RESULT_AT = 10

function App() {
  const [screen, setScreen] = useState<Screen>("top")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [history, setHistory] = useState<SwipeEntry[]>([])
  const [currentCard, setCurrentCard] = useState<Job | null>(null)
  const [likeButtonSide, setLikeButtonSide] = useState<"left" | "right">("right")
  const [midShown, setMidShown] = useState(false)

  const [resultData, setResultData] = useState<RecommendResponse | null>(null)
  const [knownJobIds, setKnownJobIds] = useState<number[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  useEffect(() => {
    // Renderの無料枠がスリープしていても、トップ画面表示時点で起こしておく。
    warmupApi()
  }, [])

  async function goToResult(finalHistory: SwipeEntry[]) {
    const data = await fetchResult(finalHistory)
    setResultData(data)
    setKnownJobIds([])
    setScreen("result")
  }

  async function handleStart() {
    setLoading(true)
    setError(null)
    try {
      setHistory([])
      setMidShown(false)
      setLikeButtonSide(Math.random() < 0.5 ? "left" : "right")
      const { card, done } = await fetchNextCard([])
      if (done || !card) {
        setError("紹介できる職業がありませんでした。")
        return
      }
      setCurrentCard(card)
      setScreen("swipe")
    } catch {
      setError("うまく読み込めませんでした。しばらくしてからもう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  async function handleReact(direction: SwipeDirection) {
    if (!currentCard) return
    const newHistory = [...history, { job_id: currentCard.job_id, direction }]
    setHistory(newHistory)
    setCurrentCard(null)

    setLoading(true)
    setError(null)
    try {
      if (newHistory.length === MID_RESULT_AT && !midShown) {
        setMidShown(true)
        const data = await fetchResult(newHistory)
        setResultData(data)
        setScreen("midResult")
        return
      }

      const { card, done } = await fetchNextCard(newHistory)
      if (done || !card) {
        await goToResult(newHistory)
        return
      }
      setCurrentCard(card)
    } catch {
      setError("うまく読み込めませんでした。しばらくしてからもう一度お試しください。")
      setScreen("top")
    } finally {
      setLoading(false)
    }
  }

  async function handleContinueFromMid() {
    setLoading(true)
    setError(null)
    try {
      const { card, done } = await fetchNextCard(history)
      if (done || !card) {
        await goToResult(history)
        return
      }
      setCurrentCard(card)
      setScreen("swipe")
    } catch {
      setError("うまく読み込めませんでした。しばらくしてからもう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  function handleSeeResultFromMid() {
    if (!resultData) return
    setKnownJobIds([])
    setScreen("result")
  }

  function handleMarkKnown(jobId: number) {
    setKnownJobIds((prev) => [...prev, jobId])
  }

  function handleSelectJob(job: Job) {
    setSelectedJob(job)
    setScreen("detail")
  }

  if (screen === "top") {
    return <TopScreen loading={loading} error={error} onStart={handleStart} />
  }

  if (screen === "swipe") {
    return (
      <SwipeScreen
        card={currentCard}
        cardNumber={history.length + 1}
        likeButtonSide={likeButtonSide}
        loading={loading}
        onReact={handleReact}
      />
    )
  }

  if (screen === "midResult" && resultData) {
    return (
      <MidResultScreen
        explanation={resultData.explanation}
        onContinue={handleContinueFromMid}
        onSeeResult={handleSeeResultFromMid}
      />
    )
  }

  if (screen === "result" && resultData) {
    return (
      <ResultScreen
        explanation={resultData.explanation}
        jobs={resultData.jobs}
        knownJobIds={knownJobIds}
        onMarkKnown={handleMarkKnown}
        onSelectJob={handleSelectJob}
      />
    )
  }

  if (screen === "detail" && selectedJob) {
    return <JobDetailScreen job={selectedJob} onBack={() => setScreen("result")} />
  }

  return null
}

export default App
