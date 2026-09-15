import type { DiscoverResponse, Job } from "./types"

// 本番はVercelの環境変数 VITE_API_BASE_URL（Renderのapi URL）から読む。
// 未設定時はローカル開発用に127.0.0.1へフォールバックする。
// "localhost"だとIPv6(::1)に先に解決される環境があり、別プロセスがそちらの
// ポートを掴んでいると誤接続するため、127.0.0.1を明示する。
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"

export async function fetchSubjects(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/subjects`)
  if (!res.ok) throw new Error("教科の取得に失敗しました")
  return res.json()
}

export async function fetchAreas(): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/areas`)
  if (!res.ok) throw new Error("エリア情報の取得に失敗しました")
  return res.json()
}

export async function discover(subject: string, knownJobIds: number[]): Promise<DiscoverResponse> {
  const res = await fetch(`${API_BASE}/discover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, known_job_ids: knownJobIds }),
  })
  if (!res.ok) throw new Error("職業を見つけられませんでした")
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
  fetch(`${API_BASE}/health`).catch(() => {
    // ウォームアップ失敗は無視する。
  })
}
