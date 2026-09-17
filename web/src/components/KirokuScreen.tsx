import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, ChevronDown, Minus } from "lucide-react"
import { useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { formatMinutes } from "../format"
import type { SubjectJobRow, SubjectTotal, WeekSummary } from "../storage"

const DONUT_COLORS = ["#2F6B4F", "#E8734A", "#24543d", "#d35f38", "#f0916a", "#6b6358", "#8a5a22"]
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"]

const SUBJECT_FLAVOR: Record<string, string> = {
  数学: "理系",
  理科: "科学",
  社会: "社会科学",
  国語: "ことば",
  英語: "語学",
  美術: "表現",
  音楽: "表現",
  "美術・音楽": "表現", // 旧データ（分離前に記録されたログ）のため変換せず残す
  "技術・家庭": "ものづくり",
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** 30日分の日付を月カレンダー形式（週×7列）に並べる。先頭・末尾は曜日を揃えるnullパディング。 */
function buildCalendarWeeks(dates: string[]): (string | null)[][] {
  if (dates.length === 0) return []
  const firstWeekday = new Date(`${dates[0]}T00:00:00`).getDay()
  const cells: (string | null)[] = [...Array(firstWeekday).fill(null), ...dates]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

interface Props {
  calendarDates: string[]
  studiedDates: Set<string>
  discoveredDates: Set<string>
  thisWeek: WeekSummary
  lastWeek: WeekSummary
  weeklySubjectTotals: SubjectTotal[]
  subjectJobHistory: SubjectJobRow[]
  mostStudied: SubjectTotal | null
  specialSubjects: string[]
  onBack: () => void
  onSelectJob: (jobId: number) => void
}

export function KirokuScreen({
  calendarDates,
  studiedDates,
  discoveredDates,
  thisWeek,
  lastWeek,
  weeklySubjectTotals,
  subjectJobHistory,
  mostStudied,
  specialSubjects,
  onBack,
  onSelectJob,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const flavor = mostStudied ? (SUBJECT_FLAVOR[mostStudied.subject] ?? "いろいろな") : null
  const weeks = buildCalendarWeeks(calendarDates)

  function toggleExpanded(subject: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(subject)) next.delete(subject)
      else next.add(subject)
      return next
    })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm font-medium text-charcoal-muted transition hover:text-sage-700"
      >
        ← もどる
      </button>

      <h2 className="text-2xl font-bold tracking-tight">きろく</h2>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="rounded-3xl border border-border-soft bg-white p-5 shadow-[0_4px_16px_rgba(47,107,79,0.08)]"
      >
        <p className="font-bold">過去30日間</p>
        <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-[10px] text-charcoal-muted">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="mt-1 flex flex-col gap-1.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1.5">
              {week.map((date, di) =>
                date ? (
                  <div key={date} className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] text-charcoal-muted">
                      {new Date(`${date}T00:00:00`).getDate()}
                    </span>
                    <span
                      className="h-3 w-3 rounded-full"
                      style={
                        studiedDates.has(date) && discoveredDates.has(date)
                          ? { background: "linear-gradient(90deg, #2F6B4F 50%, #E8734A 50%)" }
                          : studiedDates.has(date)
                            ? { backgroundColor: "#2F6B4F" }
                            : discoveredDates.has(date)
                              ? { backgroundColor: "#E8734A" }
                              : { backgroundColor: "#e4dfd5" }
                      }
                    />
                  </div>
                ) : (
                  <div key={`empty-${wi}-${di}`} />
                ),
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sage-600" />
            勉強した日
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-coral-500" />
            職業を発見した日
          </span>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="rounded-3xl border border-border-soft bg-white p-5 shadow-[0_4px_16px_rgba(47,107,79,0.08)]"
      >
        <p className="mb-3 font-bold">週間サマリー</p>
        <div className="flex flex-col gap-3">
          <ComparisonRow
            label="今週の合計勉強時間"
            currentLabel={formatMinutes(thisWeek.totalMinutes)}
            diff={thisWeek.totalMinutes - lastWeek.totalMinutes}
          />
          <ComparisonRow
            label="今週見つけた職業数"
            currentLabel={`${thisWeek.discoveredCount}件`}
            diff={thisWeek.discoveredCount - lastWeek.discoveredCount}
          />
        </div>
      </motion.div>

      {weeklySubjectTotals.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="rounded-3xl border border-border-soft bg-white p-5 shadow-[0_4px_16px_rgba(47,107,79,0.08)]"
        >
          <p className="font-bold">教科別の時間比率（今週）</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weeklySubjectTotals}
                    dataKey="minutes"
                    nameKey="subject"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {weeklySubjectTotals.map((entry, i) => (
                      <Cell key={entry.subject} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}分`, "勉強時間"]}
                    contentStyle={{ borderRadius: 12, borderColor: "#e4dfd5", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-1 flex-col gap-1.5 text-xs">
              {weeklySubjectTotals.map((entry, i) => (
                <li key={entry.subject} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                  />
                  <span className="flex-1">{entry.subject}</span>
                  <span className="text-charcoal-muted">{formatMinutes(entry.minutes)}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="rounded-3xl border border-border-soft bg-sage-50 p-5"
      >
        {mostStudied ? (
          <p className="text-sm font-medium leading-relaxed text-sage-700">
            最近は{mostStudied.subject}が多いね。{flavor}の仕事にたくさん出会えそう！
          </p>
        ) : (
          <p className="text-sm font-medium leading-relaxed text-sage-700">
            まだ記録がないよ。今日の勉強を記録してみよう。
          </p>
        )}
      </motion.div>

      <div>
        <p className="mb-3 font-bold">勉強した教科と見つかった職業</p>
        {subjectJobHistory.length === 0 ? (
          <p className="text-sm text-charcoal-muted">まだ記録がありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {subjectJobHistory.map((row, i) => {
              const isOpen = expanded.has(row.subject)
              return (
                <motion.div
                  key={row.subject}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  transition={{ delay: Math.min(i, 4) * 0.05 }}
                  className="rounded-3xl border border-border-soft bg-white p-4 shadow-[0_4px_16px_rgba(47,107,79,0.08)]"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(row.subject)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <p className="font-bold">{row.subject}</p>
                    <span className="flex items-center gap-2">
                      <span className="text-sm text-charcoal-muted">合計{formatMinutes(row.minutes)}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-charcoal-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>

                  <div className="mt-2 border-t border-border-soft pt-2">
                    <p className="mb-1.5 text-xs text-charcoal-muted">見つかった仕事</p>
                    {specialSubjects.includes(row.subject) ? (
                      <p className="text-xs text-charcoal-muted">職業発見には未対応</p>
                    ) : row.jobs.length === 0 ? (
                      <p className="text-sm text-charcoal-muted">まだ見つかった仕事はないよ</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {row.jobs.map((job) => (
                          <button
                            key={job.jobId}
                            type="button"
                            onClick={() => onSelectJob(job.jobId)}
                            className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700 transition hover:bg-sage-100"
                          >
                            {job.jobName} ・ {formatShortDate(job.discoveredAt)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isOpen && (
                    <div className="mt-3 border-t border-border-soft pt-3">
                      <p className="mb-1.5 text-xs text-charcoal-muted">記録ログ</p>
                      <ul className="flex flex-col gap-2">
                        {row.logs.map((log, li) => (
                          <li key={li} className="rounded-2xl bg-cream px-3 py-2 text-xs">
                            <div className="flex items-center justify-between font-medium">
                              <span>{formatDateLabel(log.date)}</span>
                              <span className="text-charcoal-muted">{log.minutes}分</span>
                            </div>
                            {(log.material || log.content) && (
                              <p className="mt-0.5 text-charcoal-muted">
                                {[log.material, log.content].filter(Boolean).join(" ・ ")}
                              </p>
                            )}
                            {log.memo && <p className="mt-0.5 text-charcoal-muted">メモ: {log.memo}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ComparisonRow({
  label,
  currentLabel,
  diff,
}: {
  label: string
  currentLabel: string
  diff: number
}) {
  const Icon = diff > 0 ? ArrowUp : diff < 0 ? ArrowDown : Minus
  const color = diff > 0 ? "text-sage-600" : diff < 0 ? "text-coral-500" : "text-charcoal-muted"
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-charcoal-muted">{label}</span>
      <span className="flex items-center gap-1">
        <span className="text-lg font-bold tracking-tight">{currentLabel}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </span>
    </div>
  )
}
