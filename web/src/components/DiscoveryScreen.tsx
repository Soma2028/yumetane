import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useState } from "react"
import { iconForTags } from "../tagIcons"
import { TaneCharacter } from "./TaneCharacter"
import { TaneSpeech } from "./TaneSpeech"
import type { Job } from "../types"

interface Props {
  job: Job | null
  exhausted: boolean
  subject: string
  zukanCount: number
  speechLines: string[]
  allDiscovered: boolean
  justGrew: boolean
  isTane: boolean
  onToggleTane: () => void
  onDone: () => void
}

export function DiscoveryScreen({
  job,
  exhausted,
  subject,
  zukanCount,
  speechLines,
  allDiscovered,
  justGrew,
  isTane,
  onToggleTane,
  onDone,
}: Props) {
  if (exhausted || !job) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="text-xl font-bold tracking-tight">
          {subject}の仕事はぜんぶ見つけたよ
        </h2>
        <p className="text-sm leading-relaxed text-charcoal-muted">
          他の教科も勉強してみると、また新しい仕事に出会えるかも。
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-4 rounded-full bg-sage-600 px-8 py-3 font-bold text-white transition active:bg-sage-700"
        >
          ホームにもどる
        </button>
      </div>
    )
  }

  const Icon = iconForTags(job.tags)
  const showGrowthToast = justGrew && !allDiscovered

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      {allDiscovered && <PetalConfetti />}

      <div className="flex items-start gap-3">
        <TaneCharacter count={zukanCount} size={80} popIn justGrew={showGrowthToast} />
        <motion.div
          className="mt-1 flex-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <TaneSpeech lines={speechLines} />
        </motion.div>
      </div>

      {showGrowthToast && (
        <motion.div
          className="flex items-start gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <TaneCharacter count={zukanCount} size={40} />
          <TaneSpeech lines={["タネが育ったよ！"]} className="flex-1" />
        </motion.div>
      )}

      <motion.div
        className="overflow-hidden rounded-3xl border border-border-soft bg-white shadow-[0_4px_16px_rgba(47,107,79,0.08)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
      >
        <div className="flex h-40 items-center justify-center bg-sage-100">
          <Icon className="h-16 w-16 text-sage-600" strokeWidth={1.5} />
        </div>
        <div className="px-5 pt-4 pb-5">
          <h3 className="text-xl font-bold tracking-tight">{job.job_name}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-charcoal-muted">{job.description}</p>
          {job.riasec_source === "predicted" && (
            <span className="mt-2 inline-block rounded-full bg-notice-bg px-3 py-1 text-xs font-medium text-notice-text">
              まだデータが少ないから、仕事の内容から予想したよ
            </span>
          )}
        </div>
      </motion.div>

      <p className="text-center text-xs text-charcoal-muted">図鑑に登録したよ</p>

      <button
        type="button"
        onClick={onToggleTane}
        className={
          "flex items-center justify-center gap-2 rounded-full py-3 font-bold transition " +
          (isTane
            ? "bg-sage-600 text-white active:bg-sage-700"
            : "border border-border-soft text-charcoal-muted active:bg-gray-100")
        }
      >
        <Star className="h-5 w-5" fill={isTane ? "currentColor" : "none"} strokeWidth={1.5} />
        {isTane ? "タネに保存したよ" : "気になる（タネに保存）"}
      </button>

      <button
        type="button"
        onClick={onDone}
        className="rounded-full border border-border-soft py-3 text-center font-bold text-charcoal-muted transition active:bg-gray-100"
      >
        ホームにもどる
      </button>
    </div>
  )
}

const PETAL_COLOR = "#E8734A"

interface Petal {
  id: number
  left: number
  delay: number
  duration: number
  rotate: number
}

function generatePetals(): Petal[] {
  // 5秒間降り続けて見えるよう、delay(0〜2s)+duration(2.5〜3.5s)の合計を5s前後に揃える
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 1,
    rotate: 180 + Math.random() * 360,
  }))
}

/** 167件達成のときだけ降らせる花吹雪（コーラル色、約5秒間）。マウント時に一度だけ生成する。 */
function PetalConfetti() {
  const [petals] = useState<Petal[]>(generatePetals)

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {petals.map((p) => (
        <motion.span
          key={p.id}
          className="absolute h-2.5 w-2.5"
          style={{ left: `${p.left}%`, backgroundColor: PETAL_COLOR, borderRadius: "60% 40% 60% 40%" }}
          initial={{ top: "-6%", opacity: 0.9, rotate: 0 }}
          animate={{ top: "110%", rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  )
}
