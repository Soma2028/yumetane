import { BarChart3, BookOpen, ChevronRight, Flame, Star, type LucideIcon } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import type { RecordDetails, StudyLogEntry } from "../storage"
import { formatMinutes } from "../format"
import { InstallHint } from "./InstallHint"
import { MAX_JOB_COUNT, stageProgress } from "../taneStage"
import { TaneCharacter } from "./TaneCharacter"
import { TaneSpeech } from "./TaneSpeech"

const MEMO_MAX_LENGTH = 100
const LABEL_MAX_LENGTH = 40
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"]

interface Props {
  subjects: string[]
  todaysLogs: StudyLogEntry[]
  todaysTotalMinutes: number
  streak: number
  zukanCount: number
  taneCount: number
  /** 直近7日間の合計勉強時間（分）。きろくボタンに出す。 */
  weeklyMinutes: number
  todaysDiscoveredJob: { jobId: number; jobName: string } | null
  /** 最近見つけた仕事（今日の分を除き、新しい順に最大3件）。 */
  recentJobs: { jobId: number; jobName: string; subject: string }[]
  toast: string | null
  loading: boolean
  error: string | null
  weekDates: string[]
  studiedDates: Set<string>
  onRecord: (subject: string, minutes: number, details: RecordDetails) => void
  onOpenZukan: () => void
  onOpenTane: () => void
  onOpenKiroku: () => void
  onOpenGrowth: () => void
  onSelectJob: (jobId: number) => void
}

export function HomeScreen({
  subjects,
  todaysLogs,
  todaysTotalMinutes,
  streak,
  zukanCount,
  taneCount,
  weeklyMinutes,
  todaysDiscoveredJob,
  recentJobs,
  toast,
  loading,
  error,
  weekDates,
  studiedDates,
  onRecord,
  onOpenZukan,
  onOpenTane,
  onOpenKiroku,
  onOpenGrowth,
  onSelectJob,
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState<string | null>(null)
  const [minutesInput, setMinutesInput] = useState("30")
  const [material, setMaterial] = useState("")
  const [content, setContent] = useState("")
  const [memo, setMemo] = useState("")

  const { nextThreshold } = stageProgress(zukanCount)
  const growthLabel = nextThreshold !== null ? `あと${nextThreshold - zukanCount}件で育つ` : "タネの部屋"

  const minutes = Number(minutesInput) || 0
  const canSubmit = subject !== null && minutes >= 10

  function handleSubmit() {
    if (!canSubmit || !subject) return
    onRecord(subject, minutes, { material, content, memo })
    setSubject(null)
    setMinutesInput("30")
    setMaterial("")
    setContent("")
    setMemo("")
    setShowForm(false)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-6 py-10">
      <div className="relative flex flex-col items-center gap-1 pt-4">
        {streak > 0 && (
          <span className="absolute right-0 top-0 flex items-center gap-1 text-sm font-medium text-charcoal-muted">
            <Flame className="h-4 w-4" />
            {streak}日連続
          </span>
        )}
        <h1 className="sr-only">夢のタネ</h1>
        {/* タネを押すとタネの部屋（育成画面）へ。キャラクターだけでは押せると分からない
            ため、下に矢印付きのピルを添え、次に育つまでの件数を見せて押す理由にする */}
        <button
          type="button"
          onClick={onOpenGrowth}
          className="group flex cursor-pointer flex-col items-center gap-1 transition-transform active:scale-95"
          aria-label={`タネの部屋を見る（${growthLabel}）`}
        >
          <TaneCharacter count={zukanCount} size={96} />
          <span className="flex items-center gap-0.5 rounded-full border border-border-soft bg-white py-1 pr-2 pl-3 text-xs font-bold text-sage-700 shadow-sm transition group-hover:border-sage-600">
            {growthLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
      </div>

      {/* 主役: 今日の成果（見つかった仕事）。無ければ何も出さず、下のCTAが主役になる */}
      {todaysDiscoveredJob && (
        <button
          type="button"
          onClick={() => onSelectJob(todaysDiscoveredJob.jobId)}
          className="flex items-center justify-between rounded-3xl border border-sage-600/20 bg-sage-50 px-5 py-4 text-left shadow-[0_4px_16px_rgba(47,107,79,0.08)] transition hover:bg-sage-100"
        >
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-sage-600">今日見つけた仕事</p>
            <p className="mt-0.5 line-clamp-2 text-lg leading-snug font-bold text-charcoal">{todaysDiscoveredJob.jobName}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-sage-600" />
        </button>
      )}

      {/* 主役: 記録アクション。フォームを開くまではコーラルのボタン単体で主張させ、
          カードの箱をかぶせない（他の白カードと同列に見えないように） */}
      <div className="flex flex-col gap-3">
        {toast && (
          <div className="flex items-start gap-2">
            <TaneCharacter count={zukanCount} size={56} speaking />
            <TaneSpeech lines={[toast]} className="flex-1" />
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-notice-bg px-3 py-2 text-sm text-notice-text">{error}</p>
        )}

        {showForm ? (
          <div className="flex flex-col gap-4 rounded-3xl border border-border-soft bg-white p-5 shadow-[0_4px_16px_rgba(47,107,79,0.08)]">
            <div className="grid grid-cols-2 gap-2">
              {subjects.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  animate={subject === s ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={
                    "rounded-xl border px-3 py-3 text-sm font-medium transition-colors " +
                    (subject === s
                      ? "border-coral-500 bg-coral-500 text-white"
                      : "border-border-soft bg-white text-charcoal hover:border-sage-600")
                  }
                >
                  {s}
                </motion.button>
              ))}
            </div>

            <label className="flex items-center gap-3 text-sm">
              <span className="text-charcoal-muted">勉強した時間</span>
              <input
                type="number"
                min={1}
                value={minutesInput}
                onChange={(e) => setMinutesInput(e.target.value)}
                className="w-20 rounded-lg border border-border-soft px-3 py-2 text-right"
              />
              <span className="text-charcoal-muted">分</span>
            </label>

            {minutes > 0 && minutes < 10 && (
              <p className="rounded-lg bg-notice-bg px-3 py-2 text-xs text-notice-text">
                10分未満は記録できません
              </p>
            )}

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-charcoal-muted">教材名（任意）</span>
              <input
                type="text"
                value={material}
                maxLength={LABEL_MAX_LENGTH}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="例：チャート式"
                className="rounded-lg border border-border-soft px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-charcoal-muted">単元・内容（任意）</span>
              <input
                type="text"
                value={content}
                maxLength={LABEL_MAX_LENGTH}
                onChange={(e) => setContent(e.target.value)}
                placeholder="例：二次方程式"
                className="rounded-lg border border-border-soft px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="flex items-center justify-between text-charcoal-muted">
                <span>メモ（任意）</span>
                <span className="text-xs">
                  {memo.length} / {MEMO_MAX_LENGTH}
                </span>
              </span>
              <input
                type="text"
                value={memo}
                maxLength={MEMO_MAX_LENGTH}
                onChange={(e) => setMemo(e.target.value.slice(0, MEMO_MAX_LENGTH))}
                placeholder="例：やっと解けた"
                className="rounded-lg border border-border-soft px-3 py-2"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-full border border-border-soft py-3 text-center font-bold text-charcoal-muted transition active:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!canSubmit || loading}
                onClick={handleSubmit}
                className="flex-1 rounded-full bg-coral-500 py-3 text-center font-bold text-white transition active:bg-coral-600 disabled:opacity-40"
              >
                {loading ? "さがしています…" : "記録する"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={
              "rounded-full bg-coral-500 text-center font-bold text-white shadow-sm transition active:bg-coral-600 " +
              (todaysLogs.length === 0 ? "py-5 text-lg" : "py-3 text-base")
            }
          >
            {todaysLogs.length === 0 ? "今日の勉強を記録する" : "＋ 記録を追加する"}
          </button>
        )}
      </div>

      <InstallHint />

      {/* 副次情報: 今日の記録一覧。箱で囲わず、行の集まりとして控えめに見せる */}
      {todaysLogs.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-charcoal-muted">今日の記録</p>
            <p className="text-xs text-charcoal-muted">合計 {todaysTotalMinutes}分</p>
          </div>
          <ul className="flex flex-col gap-2">
            {todaysLogs.map((log, i) => (
              <li
                key={i}
                className="rounded-3xl border border-border-soft bg-cream px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between font-medium">
                  <span>{log.subject}</span>
                  <span className="text-charcoal-muted">{log.minutes}分</span>
                </div>
                {(log.material || log.content) && (
                  <p className="mt-1 truncate text-xs text-charcoal-muted">
                    {[log.material, log.content].filter(Boolean).join(" ・ ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 比較ゾーン: ストリークと週間の記録状況を1枚にまとめ、控えめなトーンで置く */}
      <div className="flex flex-col gap-3 rounded-3xl border border-border-soft bg-white p-5">
        <p className="font-bold">この1週間</p>
        <div className="flex justify-between">
          {weekDates.map((date) => {
            const studied = studiedDates.has(date)
            const isToday = date === weekDates[weekDates.length - 1]
            const d = new Date(`${date}T00:00:00`)
            return (
              <div key={date} className="flex flex-col items-center gap-1">
                <span className="text-xs text-charcoal-muted">{WEEKDAY_LABELS[d.getDay()]}</span>
                <div
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors " +
                    (studied ? "bg-sage-600 text-white" : "bg-sage-50 text-charcoal-muted") +
                    (isToday ? " border-2 border-charcoal" : "")
                  }
                >
                  {d.getDate()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 振り返り: 最近見つけた仕事。見つけて終わりにせず、もう一度開くきっかけにする。
          今日の記録と同じく箱で囲わず、行の集まりとして置く */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-charcoal-muted">最近見つけた仕事</p>
        {recentJobs.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {recentJobs.map((job) => (
              <li key={job.jobId}>
                <button
                  type="button"
                  onClick={() => onSelectJob(job.jobId)}
                  className="flex w-full items-center justify-between gap-3 rounded-3xl border border-border-soft bg-cream px-4 py-3 text-left transition hover:border-sage-600"
                >
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-sm leading-snug font-bold">{job.jobName}</span>
                    <span className="text-xs text-charcoal-muted">{job.subject}の勉強から</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-charcoal-muted" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-3xl border border-dashed border-border-soft px-4 py-5 text-center text-sm leading-relaxed text-charcoal-muted">
            {todaysDiscoveredJob
              ? "明日も記録すると、ここに仕事が並んでいくよ"
              : "勉強を記録すると、見つけた仕事がここに並ぶよ"}
          </p>
        )}
      </div>

      {/* 行動する（次へ）: 深掘り先への導線 */}
      {/* 3つとも「アイコン・名前・今の状態」の同じ形にそろえる（以前は図鑑だけ数字が主役で、
          何のボタンか読み取りにくかった） */}
      <nav aria-label="ほかの画面" className="mt-auto grid grid-cols-3 gap-3">
        <NavButton icon={BookOpen} label="職業図鑑" detail={`${zukanCount}/${MAX_JOB_COUNT}件`} onClick={onOpenZukan} />
        <NavButton icon={Star} label="タネ" detail={`保存${taneCount}件`} onClick={onOpenTane} />
        <NavButton
          icon={BarChart3}
          label="きろく"
          detail={weeklyMinutes > 0 ? `今週${formatMinutes(weeklyMinutes)}` : "今週まだなし"}
          onClick={onOpenKiroku}
        />
      </nav>
    </div>
  )
}

function NavButton({
  icon: Icon,
  label,
  detail,
  onClick,
}: {
  icon: LucideIcon
  label: string
  detail: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-border-soft bg-white px-1 pt-3.5 pb-3 transition hover:border-sage-600 active:scale-95"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-50">
        <Icon className="h-5 w-5 text-sage-600" strokeWidth={1.75} />
      </span>
      <span className="text-sm font-bold">{label}</span>
      <span className="text-[11px] leading-tight text-charcoal-muted">{detail}</span>
    </button>
  )
}
