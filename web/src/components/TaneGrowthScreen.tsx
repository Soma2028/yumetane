import { formatMinutes } from "../format"
import type { SubjectStat, SubjectTotal } from "../storage"
import { taneComment } from "../taneComments"
import { MAX_JOB_COUNT, stageProgress } from "../taneStage"
import { TaneCharacter } from "./TaneCharacter"

interface Props {
  zukanCount: number
  subjectStats: SubjectStat[]
  mostStudied: SubjectTotal | null
  onBack: () => void
}

export function TaneGrowthScreen({ zukanCount, subjectStats, mostStudied, onBack }: Props) {
  const { stage, currentMin, nextThreshold } = stageProgress(zukanCount)
  const goal = nextThreshold ?? MAX_JOB_COUNT
  const pct = Math.min(100, Math.round(((zukanCount - currentMin) / (goal - currentMin)) * 100))
  const remaining = Math.max(0, goal - zukanCount)

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm font-medium text-charcoal-muted transition hover:text-sage-700"
      >
        ← もどる
      </button>

      <h2 className="text-2xl font-bold tracking-tight">タネのせいちょう</h2>

      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border-soft bg-white p-6 text-center shadow-[0_4px_16px_rgba(47,107,79,0.08)]">
        <TaneCharacter count={zukanCount} size={160} />

        <p className="text-sm font-bold tracking-wide text-sage-600">STAGE {stage} / 4</p>

        <div className="w-full">
          <div className="h-2.5 w-full rounded-full bg-sage-50">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-sage-600 to-coral-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-charcoal-muted">
            {zukanCount} / {goal}件
          </p>
        </div>

        <p className="text-xs text-charcoal-muted">
          {nextThreshold === null
            ? remaining === 0
              ? "全部の仕事に出会えたよ！"
              : `最終ステージ。あと${remaining}件で全部の仕事に出会えるよ`
            : `次のステージまであと${remaining}件`}
        </p>
      </div>

      <div className="rounded-3xl border border-border-soft bg-white p-5 shadow-[0_4px_16px_rgba(47,107,79,0.08)]">
        <p className="mb-3 font-bold">これまでの記録</p>
        {subjectStats.length === 0 ? (
          <p className="text-sm text-charcoal-muted">まだ記録がありません</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {subjectStats.map((s) => (
              <li key={s.subject} className="flex items-center justify-between text-sm">
                <span className="font-medium">{s.subject}</span>
                <span className="text-charcoal-muted">
                  合計 {formatMinutes(s.minutes)}　{s.jobCount}件発見
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-3xl border border-border-soft bg-sage-50 p-5">
        <p className="mb-2 text-xs font-bold text-sage-700">タネからのひとこと</p>
        <p className="text-base leading-relaxed text-sage-700">🌱「{taneComment(mostStudied)}」</p>
      </div>
    </div>
  )
}
