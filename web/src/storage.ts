/**
 * 学習記録・職業図鑑・タネの永続化。サーバーには何も送らず、この端末の
 * localStorageだけに保存する（ログイン無し・個人情報を取らない、という制約のため）。
 * 端末を変えると消えるのは許容する前提（docs/design.md参照）。
 */

export interface ZukanEntry {
  jobId: number
  jobName: string
  subject: string
  area: string
  discoveredAt: string // ISO日時
}

export interface AppState {
  zukan: ZukanEntry[]
  taneIds: number[]
  lastRecordedDate: string | null // YYYY-MM-DD
  streak: number
  totalMinutes: number
}

const STORAGE_KEY = "yumetane_state_v1"

function defaultState(): AppState {
  return { zukan: [], taneIds: [], lastRecordedDate: null, streak: 0, totalMinutes: 0 }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw) }
  } catch {
    // プライベートブラウジング等でlocalStorageが使えない場合は、その場限りの状態で動かす
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 保存に失敗しても画面表示は継続する
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function hasRecordedToday(state: AppState): boolean {
  return state.lastRecordedDate === todayStr()
}

export function recordStudyAndUpdateStreak(state: AppState, minutes: number): AppState {
  const today = todayStr()
  if (state.lastRecordedDate === today) return state
  const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10)
  const streak = state.lastRecordedDate === yesterday ? state.streak + 1 : 1
  return {
    ...state,
    lastRecordedDate: today,
    streak,
    totalMinutes: state.totalMinutes + Math.max(0, minutes),
  }
}

export function addToZukan(
  state: AppState,
  jobId: number,
  jobName: string,
  subject: string,
  area: string,
): AppState {
  if (state.zukan.some((e) => e.jobId === jobId)) return state
  const entry: ZukanEntry = { jobId, jobName, subject, area, discoveredAt: new Date().toISOString() }
  return { ...state, zukan: [...state.zukan, entry] }
}

export function toggleTane(state: AppState, jobId: number): AppState {
  const has = state.taneIds.includes(jobId)
  return {
    ...state,
    taneIds: has ? state.taneIds.filter((id) => id !== jobId) : [...state.taneIds, jobId],
  }
}

export function knownJobIds(state: AppState): number[] {
  return state.zukan.map((e) => e.jobId)
}
