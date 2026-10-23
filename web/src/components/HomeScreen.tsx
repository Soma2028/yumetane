import { ChevronRight, Flame } from "lucide-react"
import { useState } from "react"
import type { RecordDetails, StudyLogEntry } from "../storage"
import { formatMinutes } from "../format"
import { InstallHint } from "./InstallHint"
import { RecordSheet } from "./RecordSheet"
import { stageProgress } from "../taneStage"
import { TaneCharacter } from "./TaneCharacter"
import { TaneSpeech } from "./TaneSpeech"

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"]

interface Props {
  subjects: string[]
  todaysLogs: StudyLogEntry[]
  todaysTotalMinutes: number
  streak: number
  zukanCount: number
  todaysDiscoveredJob: { jobId: number; jobName: string } | null
  /** 最近見つけた仕事（今日の分を除き、新しい順に最大5件。スマホでは3件まで出す）。 */
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
  /** 「この1週間」の日付を押したとき。きろくのカレンダーでその日を開く。 */
  onOpenDay: (date: string) => void
  onOpenGrowth: () => void
  onSelectJob: (jobId: number) => void
}

export function HomeScreen({
  subjects,
  todaysLogs,
  todaysTotalMinutes,
  streak,
  zukanCount,
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
  onOpenDay,
  onOpenGrowth,
  onSelectJob,
}: Props) {
  const [showForm, setShowForm] = useState(false)

  const { nextThreshold } = stageProgress(zukanCount)
  const growthLabel = nextThreshold !== null ? `あと${nextThreshold - zukanCount}件で育つ` : "タネの部屋"

  function handleRecord(subject: string, minutes: number, details: RecordDetails) {
    onRecord(subject, minutes, details)
    setShowForm(false)
  }

  return (
    // スマホは1列で1画面に収める。パソコン（lg以上）は左に記録まわり、右に見つけた仕事と
    // ほかの画面への導線を置く2列にする
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col gap-4 px-6 pt-6 pb-6 max-lg:[@media(max-height:740px)]:gap-3 max-lg:[@media(max-height:740px)]:pt-4 max-lg:[@media(max-height:740px)]:pb-4 lg:grid lg:max-w-5xl lg:grid-cols-2 lg:content-center lg:items-start lg:gap-12 lg:px-10 lg:py-14">
      <div className="flex flex-col gap-4 max-lg:[@media(max-height:740px)]:gap-3">
      <div className="relative flex flex-col items-center gap-1 pt-2">
        {streak > 0 && (
          <span className="absolute right-0 top-5 flex items-center gap-1 text-sm font-medium text-charcoal-muted">
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
          className="group flex cursor-pointer flex-col items-center gap-1 transition-transform"
          aria-label={`タネの部屋を見る（${growthLabel}）`}
        >
          <TaneCharacter count={zukanCount} size={80} />
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

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className={
            "rounded-full bg-coral-500 text-center font-bold text-white shadow-sm transition active:bg-coral-600 " +
            (todaysLogs.length === 0 ? "py-4 text-lg" : "py-3 text-base")
          }
        >
          {todaysLogs.length === 0 ? "今日の勉強を記録する" : "＋ 記録を追加する"}
        </button>
      </div>

      <RecordSheet
        open={showForm}
        subjects={subjects}
        loading={loading}
        onSubmit={handleRecord}
        onClose={() => setShowForm(false)}
      />

      <InstallHint />

      {/* 副次情報: 今日の記録。ホームを1画面に収めるため、教科と時間を1行にまとめる
          （教材・単元・メモは、きろくのカレンダーでその日を開くと見られる） */}
      {todaysLogs.length > 0 && (
        <div className="flex items-baseline justify-between gap-3 rounded-2xl border border-border-soft bg-cream px-4 py-2.5 text-sm">
          <p className="min-w-0">
            <span className="mr-2 text-xs font-bold text-charcoal-muted">今日の記録</span>
            {todaysLogs.map((log) => `${log.subject} ${log.minutes}分`).join("・")}
          </p>
          <p className="shrink-0 text-xs text-charcoal-muted">合計 {formatMinutes(todaysTotalMinutes)}</p>
        </div>
      )}

      {/* 比較ゾーン: ストリークと週間の記録状況を1枚にまとめ、控えめなトーンで置く */}
      <div className="flex flex-col gap-2 rounded-3xl border border-border-soft bg-white px-5 py-4 max-lg:[@media(max-height:740px)]:py-3">
        <p className="font-bold">この1週間</p>
        <div className="flex justify-between">
          {weekDates.map((date) => {
            const studied = studiedDates.has(date)
            const isToday = date === weekDates[weekDates.length - 1]
            const d = new Date(`${date}T00:00:00`)
            return (
              <button
                key={date}
                type="button"
                onClick={() => onOpenDay(date)}
                aria-label={`${d.getMonth() + 1}月${d.getDate()}日の記録を見る`}
                className="flex flex-col items-center gap-1 rounded-xl px-0.5 py-0.5 transition hover:bg-sage-50"
              >
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
              </button>
            )
          })}
        </div>
      </div>

      </div>

      <div className="flex flex-1 flex-col gap-4 max-lg:[@media(max-height:740px)]:gap-3">
      {/* 振り返り: 最近見つけた仕事。見つけて終わりにせず、もう一度開くきっかけにする。
          スマホでは今日見つけた仕事が上に出ている日は1件に減らし、画面の低い端末では欄ごと隠す。
          パソコンは右の列を使えるので5件まで出す */}
      <div className={todaysDiscoveredJob ? "max-lg:[@media(max-height:740px)]:hidden" : undefined}>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-charcoal-muted lg:text-sm">最近見つけた仕事</p>
        {recentJobs.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {recentJobs.map((job, i) => (
              // スマホの件数を超える分はパソコンだけで出す。画面の低い端末（iPhone SEなど）では1件だけ
              <li
                key={job.jobId}
                className={
                  i >= (todaysDiscoveredJob ? 1 : 3)
                    ? "max-lg:hidden"
                    : i > 0
                      ? "max-lg:[@media(max-height:740px)]:hidden"
                      : undefined
                }
              >
                <button
                  type="button"
                  onClick={() => onSelectJob(job.jobId)}
                  className="flex w-full items-center justify-between gap-3 rounded-3xl border border-border-soft bg-cream px-4 py-2.5 text-left transition hover:border-sage-600"
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

      {/* 行動する（次へ）: ほかの画面への導線。きろくのタブ（今週・カレンダー・教科ごと）と
          同じ見た目の、丸い枠に3つが並ぶ形にそろえる */}
      <nav
        aria-label="ほかの画面"
        className="mt-auto grid grid-cols-3 gap-1 rounded-full border border-border-soft bg-white p-1 lg:mt-2"
      >
        {[
          { label: "職業図鑑", onClick: onOpenZukan },
          { label: "タネ", onClick: onOpenTane },
          { label: "きろく", onClick: onOpenKiroku },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="h-10 rounded-full text-sm font-bold text-charcoal-muted transition hover:bg-sage-50 hover:text-sage-700"
          >
            {item.label}
          </button>
        ))}
      </nav>
      </div>
    </div>
  )
}
