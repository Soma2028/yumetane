import { motion } from "framer-motion"
import { formatMinutes } from "../format"
import { cardInView } from "../motion"
import type { SubjectStat, SubjectTotal } from "../storage"
import { subjectColor } from "../subjectColors"
import { taneComment } from "../taneComments"
import { MAX_JOB_COUNT, STAGE_MIN, stageProgress } from "../taneStage"
import { BackButton } from "./BackButton"
import { SubjectDot } from "./SubjectDot"
import { TaneCharacter } from "./TaneCharacter"

interface Props {
  zukanCount: number
  streak: number
  totalMinutes: number
  subjectStats: SubjectStat[]
  mostStudied: SubjectTotal | null
  onBack: () => void
}

const ROOM_HEIGHT = 320
const STAGE_NAMES = ["タネ", "双葉", "葉っぱ4枚", "根が張る", "花が咲く"]

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

/**
 * タネの部屋。以前は部屋の絵の下に、ステージ・ひとこと・記録が文字で縦に並ぶだけで、
 * 「育っている」ことが伝わりにくかった。ひとことはタネの吹き出しにし、5つの姿を並べた
 * 成長の道のり、数字のタイル、教科ごとの棒グラフで見せる。新しい遊びの仕組みは足さない。
 * パソコン（lg以上）は左に部屋、右に情報を並べる。
 */
export function TaneGrowthScreen({ zukanCount, streak, totalMinutes, subjectStats, mostStudied, onBack }: Props) {
  const { stage, currentMin, nextThreshold } = stageProgress(zukanCount)
  const goal = nextThreshold ?? MAX_JOB_COUNT
  const pct = Math.min(100, Math.round(((zukanCount - currentMin) / (goal - currentMin)) * 100))
  const remaining = Math.max(0, goal - zukanCount)
  const maxMinutes = Math.max(1, ...subjectStats.map((s) => s.minutes))

  // 画面の低い端末（iPhone SEなど）では、部屋の絵と余白を小さくして1画面に収める
  const compact = typeof window !== "undefined" && window.matchMedia("(max-height: 740px) and (max-width: 1023px)").matches
  const roomHeight = compact ? 192 : ROOM_HEIGHT
  const wallHeight = Math.round(roomHeight / 3)

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col lg:max-w-5xl lg:flex-row lg:items-start lg:gap-8 lg:px-10 lg:py-10">
      {/* タネの部屋（パソコンでは左に固定） */}
      <div
        className="relative shrink-0 overflow-hidden lg:sticky lg:top-10 lg:w-[400px] lg:rounded-3xl lg:border lg:border-border-soft lg:!h-[520px]"
        style={{ height: roomHeight }}
      >
        <h2 className="sr-only">タネの部屋</h2>
        <div className="absolute inset-x-0 top-0 lg:!h-[173px]" style={{ height: wallHeight, backgroundColor: "#EBF2ED" }} />
        <div
          className="absolute inset-x-0 bottom-0 lg:!top-[173px]"
          style={{
            top: wallHeight,
            backgroundColor: "#F5EDD8",
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 20px, rgba(180,150,90,0.14) 20px, rgba(180,150,90,0.14) 22px)",
          }}
        />
        <div className="absolute inset-x-0 lg:!top-[173px]" style={{ top: wallHeight, height: 2, backgroundColor: "#D4C4A8" }} />

        <BackButton onClick={onBack} className="absolute top-4 left-4 z-10" />
        <div className="absolute top-4 right-4">
          <RoomWindow />
        </div>

        {/* タネのひとこと。部屋の中で、タネが話しているように見せる */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className={
            "absolute right-4 left-[46%] rounded-2xl border border-border-soft bg-white px-3 py-2 text-[13px] leading-relaxed text-charcoal shadow-sm lg:top-24 lg:left-[44%] " +
            (compact ? "top-14" : "top-20")
          }
        >
          {taneComment(mostStudied)}
        </motion.p>

        <div className="absolute inset-x-0 flex flex-col items-start pl-[14%] lg:!bottom-16 lg:pl-[12%]" style={{ bottom: compact ? 8 : 20 }}>
          <TaneCharacter count={zukanCount} size={compact ? 104 : 150} />
          <div
            style={{
              marginTop: compact ? -28 : -42,
              marginLeft: compact ? 0 : 20,
              transform: compact ? "scale(0.72)" : undefined,
              transformOrigin: "top left",
            }}
          >
            <PlantPot />
          </div>
        </div>
      </div>

      {/* 情報（パソコンでは右） */}
      <div className="flex flex-1 flex-col gap-4 rounded-t-3xl bg-cream px-6 pt-5 pb-6 lg:rounded-none lg:bg-transparent lg:p-0 [@media(max-height:740px)]:gap-3 [@media(max-height:740px)]:pt-3 [@media(max-height:740px)]:pb-4">
        {/* 成長の道のり：5つの姿を並べ、今の姿を強調し、まだの姿は影で見せる */}
        <motion.section {...cardInView(0)} className="ui-card px-4 pt-4 pb-4 [@media(max-height:740px)]:pt-3 [@media(max-height:740px)]:pb-3">
          <div className="flex items-baseline justify-between">
            <p className="ui-section-label text-sage-600">STAGE {stage} / 4</p>
            <p className="text-xs text-charcoal-muted">{STAGE_NAMES[stage]}</p>
          </div>
          <ol className="relative mt-2 grid grid-cols-5">
            <span aria-hidden className="absolute top-6 right-[10%] left-[10%] h-0.5 bg-border-soft" />
            <span
              aria-hidden
              className="absolute top-6 left-[10%] h-0.5 bg-sage-600"
              style={{ width: `${(stage / 4) * 80}%` }}
            />
            {STAGE_MIN.map((min, s) => {
              const reached = s <= stage
              return (
                <li key={s} className="relative flex flex-col items-center gap-0.5">
                  <span
                    className={
                      "flex h-12 w-12 items-center justify-center rounded-full bg-white " +
                      (s === stage ? "ring-2 ring-sage-600" : "ring-1 ring-border-soft")
                    }
                  >
                    <img
                      src={`/images/tane/stage${s}.png`}
                      alt={reached ? STAGE_NAMES[s] : `まだの姿（${min}件で）`}
                      width={44}
                      height={44}
                      className="h-11 w-11 object-contain"
                      // まだの姿は、色を抜いて暗くした影にする（薄くするだけだと白い丸の上で見えない）
                      style={{ mixBlendMode: "multiply", filter: reached ? undefined : "grayscale(1) brightness(0.55) opacity(0.35)" }}
                    />
                  </span>
                  <span className={"text-xs " + (s === stage ? "font-bold text-sage-700" : "text-charcoal-muted")}>
                    {s === stage ? "いま" : `${min}件`}
                  </span>
                </li>
              )
            })}
          </ol>
          <div className="mt-2 h-2 w-full rounded-full bg-sage-50">
            <div className="h-2 rounded-full bg-sage-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-charcoal-muted">
            {nextThreshold === null
              ? remaining === 0
                ? "全部の仕事に出会えたよ！"
                : `花が咲いたよ。あと${remaining}件で全部の仕事に出会える`
              : `あと${remaining}件で「${STAGE_NAMES[stage + 1]}」の姿になるよ（${zukanCount} / ${goal}件）`}
          </p>
        </motion.section>

        {/* 数字のタイル */}
        <motion.div {...cardInView(1)} className="grid grid-cols-3 gap-2">
          {[
            { label: "図鑑", value: `${zukanCount}件` },
            { label: "連続", value: `${streak}日` },
            { label: "合計", value: formatMinutes(totalMinutes) },
          ].map((t) => (
            <div key={t.label} className="ui-card px-2 py-2.5 text-center [@media(max-height:740px)]:py-2">
              <p className="ui-section-label">{t.label}</p>
              <p className="mt-0.5 text-base font-bold">{t.value}</p>
            </div>
          ))}
        </motion.div>

        {/* これまでの記録：教科ごとの勉強時間を、その教科の色の棒で見せる */}
        <motion.section {...cardInView(2)} className="ui-card px-4 py-4 [@media(max-height:740px)]:py-3">
          <p className="ui-card-title">これまでの記録</p>
          {subjectStats.length === 0 ? (
            <p className="mt-2 text-sm text-charcoal-muted">まだ記録がないよ</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {subjectStats.map((s) => (
                <li key={s.subject} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-charcoal">
                    <SubjectDot subject={s.subject} className="h-2 w-2" />
                    {s.subject}
                  </span>
                  <span className="h-2 rounded-full bg-sage-50">
                    <span
                      className="block h-2 rounded-full"
                      style={{ width: `${(s.minutes / maxMinutes) * 100}%`, backgroundColor: subjectColor(s.subject).solid }}
                    />
                  </span>
                  <span className="text-right text-charcoal-muted">
                    {formatMinutes(s.minutes)}・{s.jobCount}件
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>
    </div>
  )
}
