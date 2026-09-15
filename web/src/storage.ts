/**
 * 学習記録・職業図鑑・タネの永続化。サーバーには何も送らず、この端末の
 * localStorageだけに保存する（ログイン無し・個人情報を取らない、という制約のため）。
 * 端末を変えると消えるのは許容する前提（docs/design.md参照）。
 *
 * 1日に何回でも記録できるスタディプラス型。職業が見つかるのはその日の
 * 最初の記録のときだけで、2回目以降はログに積むだけ（discoveredJobIdはnull）。
 */

export interface ZukanEntry {
  jobId: number
  jobName: string
  subject: string
  area: string
  discoveredAt: string // ISO日時
}

export interface StudyLogEntry {
  date: string // YYYY-MM-DD
  subject: string
  minutes: number
  discoveredJobId: number | null // その日最初の記録のときだけ値が入る
}

export interface AppState {
  zukan: ZukanEntry[]
  taneIds: number[]
  logs: StudyLogEntry[]
  lastRecordedDate: string | null // YYYY-MM-DD
  streak: number
  totalMinutes: number
}

const STORAGE_KEY = "yumetane_state_v1"

function defaultState(): AppState {
  return { zukan: [], taneIds: [], logs: [], lastRecordedDate: null, streak: 0, totalMinutes: 0 }
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

export function todaysLogs(state: AppState): StudyLogEntry[] {
  const today = todayStr()
  return state.logs.filter((l) => l.date === today)
}

export function todaysTotalMinutes(state: AppState): number {
  return todaysLogs(state).reduce((sum, l) => sum + l.minutes, 0)
}

export function isFirstRecordToday(state: AppState): boolean {
  return todaysLogs(state).length === 0
}

export function todaysDiscoveredJobId(state: AppState): number | null {
  const found = todaysLogs(state).find((l) => l.discoveredJobId !== null)
  return found ? found.discoveredJobId : null
}

export function recordStudy(
  state: AppState,
  subject: string,
  minutes: number,
  discoveredJobId: number | null,
): AppState {
  const today = todayStr()
  const isNewDay = state.lastRecordedDate !== today
  const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10)
  const streak = isNewDay ? (state.lastRecordedDate === yesterday ? state.streak + 1 : 1) : state.streak
  const log: StudyLogEntry = { date: today, subject, minutes, discoveredJobId }
  return {
    ...state,
    logs: [...state.logs, log],
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
