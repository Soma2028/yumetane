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

export function hasAnyPeriod(timetable: Timetable): boolean {
  return SCHOOL_DAYS.some((d) => (timetable[d] ?? []).some((s) => s !== null))
}

/**
 * ホームに出す時間割。月〜土は今日の分、日曜日は翌日（月曜）の分を「あした」として出す。
 * 1つも登録が無ければnull。
 */
export function timetableForHome(timetable: Timetable, now = new Date()): { heading: string; periods: (string | null)[] } | null {
  if (!hasAnyPeriod(timetable)) return null
  const today = now.getDay()
  const day = today === 0 ? 1 : today
  const heading = today === 0 ? "あした（月）の時間割" : `今日（${DAY_LABELS[day]}）の時間割`
  return { heading, periods: timetable[day] ?? Array(PERIODS).fill(null) }
}
