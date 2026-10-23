import { formatMinutes } from "../format"
import type { SubjectStat, SubjectTotal } from "../storage"
import { taneComment } from "../taneComments"
import { MAX_JOB_COUNT, stageProgress } from "../taneStage"
import { TaneCharacter } from "./TaneCharacter"
import { BackButton } from "./BackButton"
import { SubjectDot } from "./SubjectDot"

interface Props {
  zukanCount: number
  subjectStats: SubjectStat[]
  mostStudied: SubjectTotal | null
  onBack: () => void
}

const ROOM_HEIGHT = 320

function PlantPot() {
  return (
    <svg width="108" height="78" viewBox="0 0 120 86" aria-hidden="true">
      <rect x="10" y="6" width="100" height="12" rx="4" fill="#D35F38" />
      <path d="M 16 16 L 104 16 L 90 78 L 30 78 Z" fill="#E8734A" />
      <path d="M 20 20 L 100 20 L 97 28 L 23 28 Z" fill="#7A5230" />
    </svg>
  )
}

function RoomWindow() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <rect x="2" y="2" width="40" height="40" rx="3" fill="#E8F4F8" stroke="#ffffff" strokeWidth="4" />
      <line x1="22" y1="2" x2="22" y2="42" stroke="#ffffff" strokeWidth="3" />
      <line x1="2" y1="22" x2="42" y2="22" stroke="#ffffff" strokeWidth="3" />
    </svg>
  )
}

export function TaneGrowthScreen({ zukanCount, subjectStats, mostStudied, onBack }: Props) {
  const { stage, currentMin, nextThreshold } = stageProgress(zukanCount)
  const goal = nextThreshold ?? MAX_JOB_COUNT
  const pct = Math.min(100, Math.round(((zukanCount - currentMin) / (goal - currentMin)) * 100))
  const remaining = Math.max(0, goal - zukanCount)

  // 画面の低い端末（iPhone SEなど）では、部屋の絵と余白を小さくして1画面に収める
  // （これまでの記録が7教科あると169pxはみ出していた）
  const compact = typeof window !== "undefined" && window.matchMedia("(max-height: 740px)").matches
  const roomHeight = compact ? 196 : ROOM_HEIGHT
  const wallHeight = Math.round(roomHeight / 3)

  return (
    // 開閉の動きは、ほかの画面と同じ切り替え（App側のフェード）にそろえる
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      {/* タネの部屋 */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: roomHeight }}>
        <h2 className="sr-only">タネの部屋</h2>

        <div className="absolute inset-x-0 top-0" style={{ height: wallHeight, backgroundColor: "#EBF2ED" }} />
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            top: wallHeight,
            backgroundColor: "#F5EDD8",
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 20px, rgba(180,150,90,0.14) 20px, rgba(180,150,90,0.14) 22px)",
          }}
        />
        <div className="absolute inset-x-0" style={{ top: wallHeight, height: 2, backgroundColor: "#D4C4A8" }} />

        <BackButton onClick={onBack} className="absolute left-4 top-4 z-10" />

        <div className="absolute right-4 top-4">
          <RoomWindow />
        </div>

        <div className="absolute inset-x-0 flex flex-col items-center" style={{ bottom: compact ? 10 : 20 }}>
          <TaneCharacter count={zukanCount} size={compact ? 112 : 160} />
          <div style={{ marginTop: compact ? -30 : -44, transform: compact ? "scale(0.75)" : undefined, transformOrigin: "top center" }}>
            <PlantPot />
          </div>
        </div>
      </div>

      {/* 情報パネル */}
      <div className="flex-1 rounded-t-3xl bg-cream px-6 py-6 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] [@media(max-height:740px)]:py-4">
        <div className="divide-y divide-border-soft">
          <section className="pb-5 [@media(max-height:740px)]:pb-3">
            <p className="text-sm font-bold tracking-wide text-sage-600">STAGE {stage} / 4</p>
            <div className="mt-2 h-2.5 w-full rounded-full bg-sage-50">
              <div className="h-2.5 rounded-full bg-sage-600 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-sm text-charcoal-muted">
              {zukanCount} / {goal}件
            </p>
            <p className="mt-1 text-xs text-charcoal-muted">
              {nextThreshold === null
                ? remaining === 0
                  ? "全部の仕事に出会えたよ！"
                  : `最終ステージ。あと${remaining}件で全部の仕事に出会えるよ`
                : `次のステージまであと${remaining}件`}
            </p>
          </section>

          <section className="py-5 [@media(max-height:740px)]:py-3">
            <p className="mb-2 text-xs font-bold text-sage-700">タネからのひとこと</p>
            <p className="text-base leading-relaxed text-charcoal">🌱「{taneComment(mostStudied)}」</p>
          </section>

          <section className="pt-5 [@media(max-height:740px)]:pt-3">
            <p className="mb-3 font-bold">これまでの記録</p>
            {subjectStats.length === 0 ? (
              <p className="text-sm text-charcoal-muted">まだ記録がありません</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {subjectStats.map((s) => (
                  <li key={s.subject} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                      <SubjectDot subject={s.subject} />
                      {s.subject}
                    </span>
                    <span className="text-charcoal-muted">
                      合計 {formatMinutes(s.minutes)}　{s.jobCount}件発見
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
