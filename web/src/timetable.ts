/**
 * 時間割（月〜土 × 1〜6限）。ホームに「今日の時間割」を出すためだけに使い、記録や職業の
 * 発見とはつなげない。学習記録（yumetane_state_v1）とは別のキーに保存し、既存の記録の
 * 形には手を加えない。
 */

/** 時間割に入れられる教科。記録と同じ9教科に、記録の対象にならない授業を足す。 */
export const TIMETABLE_SUBJECTS = [
  "数学",
  "国語",
  "理科",
  "社会",
  "英語",
  "美術",
  "音楽",
  "技術・家庭",
  "保健体育",
  "道徳",
  "総合",
  "学活",
] as const

/** 表のマスに収まるよう2文字にした呼び方。 */
const SHORT_LABELS: Record<string, string> = {
  "技術・家庭": "技家",
  保健体育: "保体",
}

export function shortSubject(subject: string): string {
  return SHORT_LABELS[subject] ?? subject
}

/** 曜日（1=月〜6=土）。DateのgetDay()と同じ番号を使う。 */
export const SCHOOL_DAYS = [1, 2, 3, 4, 5, 6] as const
export const PERIODS = 6
export const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"]

/** 曜日ごとに、1〜6限の教科（空きはnull）。 */
export type Timetable = Record<number, (string | null)[]>

const STORAGE_KEY = "yumetane_timetable_v1"
/** 土曜日を表示するか。時間割とは別のキーに持ち、オフにしても土曜日の中身は消さない。 */
const SHOW_SATURDAY_KEY = "yumetane_timetable_show_saturday_v1"

export function loadShowSaturday(): boolean {
  try {
    return localStorage.getItem(SHOW_SATURDAY_KEY) !== "0"
  } catch {
    return true
  }
}

export function saveShowSaturday(show: boolean): void {
  try {
    localStorage.setItem(SHOW_SATURDAY_KEY, show ? "1" : "0")
  } catch {
    // 保存に失敗しても画面表示は継続する
  }
}

/** 表に出す曜日。土曜日をオフにしていれば月〜金。 */
export function activeDays(showSaturday: boolean): number[] {
  return SCHOOL_DAYS.filter((d) => showSaturday || d !== 6)
}

function emptyTimetable(): Timetable {
  return Object.fromEntries(SCHOOL_DAYS.map((d) => [d, Array(PERIODS).fill(null)]))
}

export function loadTimetable(): Timetable {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyTimetable()
    return { ...emptyTimetable(), ...JSON.parse(raw) }
  } catch {
    return emptyTimetable()
  }
}

export function saveTimetable(timetable: Timetable): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timetable))
  } catch {
    // 保存に失敗しても画面表示は継続する
  }
}

export function setPeriod(timetable: Timetable, day: number, period: number, subject: string | null): Timetable {
  const row = [...(timetable[day] ?? Array(PERIODS).fill(null))]
  row[period] = subject
  return { ...timetable, [day]: row }
}

export function hasAnyPeriod(timetable: Timetable, days: readonly number[] = SCHOOL_DAYS): boolean {
  return days.some((d) => (timetable[d] ?? []).some((s) => s !== null))
}

/**
 * ホームに出す時間割。表に出している曜日なら今日の分を出す。日曜日（と、土曜日を
 * オフにしているときの土曜日）は、次の月曜日の分を「あした」「あさって」として出す。
 * 表に出している曜日に1つも登録が無ければnull。
 */
export function timetableForHome(
  timetable: Timetable,
  showSaturday: boolean,
  now = new Date(),
): { heading: string; periods: (string | null)[] } | null {
  const days = activeDays(showSaturday)
  if (!hasAnyPeriod(timetable, days)) return null
  const today = now.getDay()
  if (days.includes(today)) {
    return { heading: `今日（${DAY_LABELS[today]}）の時間割`, periods: timetable[today] ?? Array(PERIODS).fill(null) }
  }
  const heading = today === 0 ? "あした（月）の時間割" : "あさって（月）の時間割"
  return { heading, periods: timetable[1] ?? Array(PERIODS).fill(null) }
}
