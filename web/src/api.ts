import type { Job, QuestionsResponse, RecommendResponse } from "./types"

// 本番はVercelの環境変数 VITE_API_BASE_URL（Renderのapi URL）から読む。
// 未設定時はローカル開発用に127.0.0.1へフォールバックする。
// "localhost"だとIPv6(::1)に先に解決される環境があり、別プロセスがそちらの
// ポートを掴んでいると誤接続するため、127.0.0.1を明示する。
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"

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

/**
 * Renderの無料枠はアイドル時にスリープするため、画面表示直後に
 * APIを一度たたいて起こしておく。結果は使わず、失敗しても画面表示には
 * 影響させない（catchで握りつぶす）。
 */
export function warmupApi(): void {
  fetch(`${API_BASE}/questions`).catch(() => {
    // ウォームアップ失敗は無視する。実際の質問取得は別途行われる。
  })
}
