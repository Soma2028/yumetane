import { useState } from "react"
import { fetchQuestions, submitAnswers } from "./api"
import { JobDetailScreen } from "./components/JobDetailScreen"
import { QuestionScreen } from "./components/QuestionScreen"
import { ResultScreen } from "./components/ResultScreen"
import { TopScreen } from "./components/TopScreen"
import type { Job, Question, RecommendResponse } from "./types"

type Screen = "top" | "question" | "result" | "detail"

function App() {
  const [screen, setScreen] = useState<Screen>("top")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [seed, setSeed] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const [result, setResult] = useState<RecommendResponse | null>(null)
  const [knownJobIds, setKnownJobIds] = useState<number[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  async function handleStart() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchQuestions()
      setSeed(data.seed)
      setQuestions(data.questions)
      setCurrentIndex(0)
      setAnswers({})
      setScreen("question")
    } catch {
      setError("質問を取得できませんでした。しばらくしてからもう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  async function handleAnswer(choiceText: string) {
    const question = questions[currentIndex]
    const nextAnswers = { ...answers, [question.id]: choiceText }
    setAnswers(nextAnswers)

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await submitAnswers(seed, nextAnswers)
      setResult(data)
      setKnownJobIds([])
      setScreen("result")
    } catch {
      setError("結果を取得できませんでした。しばらくしてからもう一度お試しください。")
      setScreen("top")
    } finally {
      setLoading(false)
    }
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

  if (screen === "question") {
    return (
      <QuestionScreen
        question={questions[currentIndex]}
        currentIndex={currentIndex}
        total={questions.length}
        onAnswer={handleAnswer}
      />
    )
  }

  if (screen === "result" && result) {
    return (
      <ResultScreen
        explanation={result.explanation}
        jobs={result.jobs}
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
