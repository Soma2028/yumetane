import type { Job, QuestionsResponse, RecommendResponse } from "./types"

// ローカル開発用。デプロイ時は環境変数に切り出す。
// "localhost"だとIPv6(::1)に先に解決される環境があり、別プロセスがそちらの
// ポートを掴んでいると誤接続する。127.0.0.1を明示する。
const API_BASE = "http://127.0.0.1:8000"

export async function fetchQuestions(): Promise<QuestionsResponse> {
  const res = await fetch(`${API_BASE}/questions`)
  if (!res.ok) throw new Error("質問の取得に失敗しました")
  return res.json()
}

export async function submitAnswers(
  seed: string,
  answers: Record<string, string>,
): Promise<RecommendResponse> {
  const res = await fetch(`${API_BASE}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seed, answers }),
  })
  if (!res.ok) throw new Error("推薦結果の取得に失敗しました")
  return res.json()
}

export async function fetchJob(jobId: number): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`)
  if (!res.ok) throw new Error("職業情報の取得に失敗しました")
  return res.json()
}
