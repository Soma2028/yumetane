/**
 * 学習記録・職業図鑑・タネの永続化。サーバーには何も送らず、この端末の
 * localStorageだけに保存する（ログイン無し・個人情報を取らない、という制約のため）。
 * 端末を変えると消えるのは許容する前提（docs/design.md参照）。
 *
 * 1日に何回でも記録できるスタディプラス型。職業が見つかるのはその日の
 * 最初の記録のときだけで、2回目以降はログに積むだけ（discoveredJobIdはnull）。
 *
 * material/content/memo、tags/descriptionはいずれも後から追加した任意項目。
 * 追加前に保存されたレコードにはこれらのキーが無いが、すべて`?`で受けて
 * undefinedのまま表示側で吸収するため、既存データを壊さずに読める。
 */

export interface ZukanEntry {
  jobId: number
  jobName: string
  subject: string
  area: string
  discoveredAt: string // ISO日時
  tags?: string[] // 追加前のレコードには無い
  description?: string // 追加前のレコードには無い
}

export interface StudyLogEntry {
  date: string // YYYY-MM-DD
  subject: string
  minutes: number
  material?: string // 教材名。任意
  content?: string // 単元・内容。任意
  memo?: string // メモ。任意、最大100文字
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

function dateNDaysAgo(n: number): string {
  return new Date(Date.now() - n * 86400_000).toISOString().slice(0, 10)
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

export interface RecordDetails {
  material?: string
  content?: string
  memo?: string
}

export function recordStudy(
  state: AppState,
  subject: string,
  minutes: number,
  discoveredJobId: number | null,
  details: RecordDetails = {},
): AppState {
  const today = todayStr()
  const isNewDay = state.lastRecordedDate !== today
  const yesterday = dateNDaysAgo(1)
  const streak = isNewDay ? (state.lastRecordedDate === yesterday ? state.streak + 1 : 1) : state.streak
  const log: StudyLogEntry = {
    date: today,
    subject,
    minutes,
    discoveredJobId,
    material: details.material || undefined,
    content: details.content || undefined,
    memo: details.memo || undefined,
  }
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
  tags: string[],
  description: string,
): AppState {
  if (state.zukan.some((e) => e.jobId === jobId)) return state
  const entry: ZukanEntry = {
    jobId,
    jobName,
    subject,
    area,
    discoveredAt: new Date().toISOString(),
    tags,
    description,
  }
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

// --- きろく（分析画面）・ホーム画面の集計系 -----------------------------

export interface SubjectTotal {
  subject: string
  minutes: number
}

/** 教科ごとの累計勉強時間（全期間）。多い順。 */
export function subjectTotals(state: AppState): SubjectTotal[] {
  const totals = new Map<string, number>()
  for (const log of state.logs) {
    totals.set(log.subject, (totals.get(log.subject) ?? 0) + log.minutes)
  }
  return [...totals.entries()]
    .map(([subject, minutes]) => ({ subject, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
}

/** 最もよく勉強している教科（全期間の累計が最大のもの）。記録が無ければnull。 */
export function mostStudiedSubject(state: AppState): SubjectTotal | null {
  const totals = subjectTotals(state)
  return totals.length > 0 ? totals[0] : null
}

export interface SubjectStat {
  subject: string
  minutes: number
  jobCount: number
}

/** 教科ごとの累計勉強時間と、その教科の勉強から見つけた職業数。多い順（タネの育成画面用）。 */
export function subjectStats(state: AppState): SubjectStat[] {
  const jobCounts = new Map<string, number>()
  for (const entry of state.zukan) {
    jobCounts.set(entry.subject, (jobCounts.get(entry.subject) ?? 0) + 1)
  }
  return subjectTotals(state).map(({ subject, minutes }) => ({
    subject,
    minutes,
    jobCount: jobCounts.get(subject) ?? 0,
  }))
}

export interface SubjectJobRow {
  subject: string
  minutes: number
  jobs: { jobId: number; jobName: string; discoveredAt: string }[]
  logs: StudyLogEntry[]
}

/** 教科ごとの累計時間、見つかった職業（発見日付つき）、記録ログ本体（日付順）。多い順。 */
export function subjectJobHistory(state: AppState): SubjectJobRow[] {
  return subjectTotals(state).map(({ subject, minutes }) => ({
    subject,
    minutes,
    jobs: state.zukan
      .filter((e) => e.subject === subject)
      .map((e) => ({ jobId: e.jobId, jobName: e.jobName, discoveredAt: e.discoveredAt }))
      .sort((a, b) => a.discoveredAt.localeCompare(b.discoveredAt)),
    logs: state.logs
      .filter((l) => l.subject === subject)
      .sort((a, b) => b.date.localeCompare(a.date)),
  }))
}

/** 過去7日分の日付（YYYY-MM-DD）を古い→新しい順で返す。末尾が今日。 */
export function last7Dates(): string[] {
  return Array.from({ length: 7 }, (_, i) => dateNDaysAgo(6 - i))
}

/** 過去30日分の日付（YYYY-MM-DD）を古い→新しい順で返す。末尾が今日。 */
export function last30Dates(): string[] {
  return Array.from({ length: 30 }, (_, i) => dateNDaysAgo(29 - i))
}

/** 記録がある日付の集合（カレンダー表示の色付け判定用）。 */
export function studiedDatesSet(state: AppState): Set<string> {
  return new Set(state.logs.map((l) => l.date))
}

/** 職業を発見した日付の集合（カレンダー表示の色付け判定用）。 */
export function discoveredDatesSet(state: AppState): Set<string> {
  return new Set(state.logs.filter((l) => l.discoveredJobId !== null).map((l) => l.date))
}

function logsInDates(state: AppState, dates: Set<string>): StudyLogEntry[] {
  return state.logs.filter((l) => dates.has(l.date))
}

/** 直近7日間（今日を含む）の合計勉強時間。 */
export function weeklyTotalMinutes(state: AppState): number {
  const dates = new Set(last7Dates())
  return logsInDates(state, dates).reduce((sum, l) => sum + l.minutes, 0)
}

/** 直近7日間の教科別合計時間。多い順。 */
export function weeklySubjectTotals(state: AppState): SubjectTotal[] {
  const dates = new Set(last7Dates())
  const totals = new Map<string, number>()
  for (const log of logsInDates(state, dates)) {
    totals.set(log.subject, (totals.get(log.subject) ?? 0) + log.minutes)
  }
  return [...totals.entries()]
    .map(([subject, minutes]) => ({ subject, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
}

export interface WeekSummary {
  totalMinutes: number
  discoveredCount: number
}

/**
 * 週単位のサマリー。weeksAgo=0で今週（直近7日、今日を含む）、
 * weeksAgo=1でその前の7日間（先週比較用）。
 */
export function weekSummary(state: AppState, weeksAgo: number): WeekSummary {
  const offset = weeksAgo * 7
  const dates = new Set(Array.from({ length: 7 }, (_, i) => dateNDaysAgo(offset + 6 - i)))
  const logs = logsInDates(state, dates)
  return {
    totalMinutes: logs.reduce((sum, l) => sum + l.minutes, 0),
    discoveredCount: logs.filter((l) => l.discoveredJobId !== null).length,
  }
}
