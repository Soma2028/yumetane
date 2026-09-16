import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import type { SubjectJobRow, SubjectTotal } from "../storage"

const DONUT_COLORS = ["#2F6B4F", "#E8734A", "#24543d", "#d35f38", "#f0916a", "#6b6358", "#8a5a22"]

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

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}分`
  if (m === 0) return `${h}時間`
  return `${h}時間${m}分`
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

interface Props {
  weeklyTotalMinutes: number
  weeklySubjectTotals: SubjectTotal[]
  subjectJobHistory: SubjectJobRow[]
  mostStudied: SubjectTotal | null
  specialSubjects: string[]
  onBack: () => void
  onSelectJob: (jobId: number) => void
}

export function KirokuScreen({
  weeklyTotalMinutes,
  weeklySubjectTotals,
  subjectJobHistory,
  mostStudied,
  specialSubjects,
  onBack,
  onSelectJob,
}: Props) {
  const flavor = mostStudied ? (SUBJECT_FLAVOR[mostStudied.subject] ?? "いろいろな") : null

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

      <div className="rounded-3xl border border-border-soft bg-white p-5 shadow-[0_4px_16px_rgba(47,107,79,0.08)]">
        <p className="text-sm text-charcoal-muted">今週の合計勉強時間</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{formatMinutes(weeklyTotalMinutes)}</p>
      </div>

      {weeklySubjectTotals.length > 0 && (
        <div className="rounded-3xl border border-border-soft bg-white p-5 shadow-[0_4px_16px_rgba(47,107,79,0.08)]">
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
        </div>
      )}

      <div className="rounded-3xl border border-border-soft bg-sage-50 p-5">
        {mostStudied ? (
          <p className="text-sm font-medium leading-relaxed text-sage-700">
            最近は{mostStudied.subject}が多いね。{flavor}の仕事にたくさん出会えそう！
          </p>
        ) : (
          <p className="text-sm font-medium leading-relaxed text-sage-700">
            まだ記録がないよ。今日の勉強を記録してみよう。
          </p>
        )}
      </div>

      <div>
        <p className="mb-3 font-bold">勉強した教科と見つかった職業</p>
        {subjectJobHistory.length === 0 ? (
          <p className="text-sm text-charcoal-muted">まだ記録がありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {subjectJobHistory.map((row) => (
              <div
                key={row.subject}
                className="rounded-3xl border border-border-soft bg-white p-4 shadow-[0_4px_16px_rgba(47,107,79,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold">{row.subject}</p>
                  <p className="text-sm text-charcoal-muted">合計{formatMinutes(row.minutes)}</p>
                </div>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
