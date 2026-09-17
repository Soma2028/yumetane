import { motion } from "framer-motion"
import { Sparkle } from "lucide-react"
import { stageFromCount, type TaneStage } from "../taneStage"

const STAGE_ALT: Record<TaneStage, string> = {
  0: "タネ（丸いタネの状態）",
  1: "タネ（双葉が出た状態）",
  2: "タネ（葉が4枚に増えた状態）",
  3: "タネ（根が張り、葉がしっかりした状態）",
  4: "タネ（花が咲いた状態）",
}

interface Props {
  count: number
  size?: number
  /** 直前よりステージが上がった直後の描画かどうか。呼び出し側が判断して渡す。 */
  justGrew?: boolean
  /** マウント時にポップインするか（発見画面など、新しく画面に現れる場面用）。 */
  popIn?: boolean
  className?: string
}

const SPARKLE_OFFSETS = [
  { x: -0.42, y: -0.3 },
  { x: 0.4, y: -0.34 },
  { x: -0.36, y: 0.32 },
  { x: 0.38, y: 0.3 },
]

/**
 * 図鑑の発見数に応じて育つキャラクター。常時ふわふわ浮遊し、わずかに揺れる。
 * justGrewのときだけ、跳ねながら周りに小さな星が4つ出て消える。
 */
export function TaneCharacter({ count, size = 80, justGrew = false, popIn = false, className }: Props) {
  const stage = stageFromCount(count)
  const popDelay = popIn ? 0.5 : 0

  return (
    <motion.div
      className={`relative inline-block shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
      animate={{ y: [0, -6, 0], rotate: [-1, 1, -1] }}
      transition={{
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <motion.img
        src={`/images/tane/stage${stage}.png`}
        alt={STAGE_ALT[stage]}
        width={size}
        height={size}
        className="rounded-xl object-contain"
        style={{ mixBlendMode: "multiply" }}
        initial={popIn ? { scale: 0 } : false}
        animate={{
          scale: popIn ? [0, 1.1, 1] : 1,
          scaleY: justGrew ? [1, 1, 0.8, 1.2, 1] : 1,
        }}
        transition={{
          scale: { duration: 0.5, ease: "easeOut" },
          scaleY: { duration: 0.4, ease: "easeInOut", delay: justGrew ? popDelay : 0 },
        }}
      />

      {justGrew &&
        SPARKLE_OFFSETS.map((o, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute left-1/2 top-1/2 text-coral-500"
            style={{ marginLeft: size * o.x, marginTop: size * o.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.6] }}
            transition={{ duration: 0.7, delay: popDelay + i * 0.06, ease: "easeOut" }}
          >
            <Sparkle className="h-3.5 w-3.5" fill="currentColor" />
          </motion.span>
        ))}
    </motion.div>
  )
}
