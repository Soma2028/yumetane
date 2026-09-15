import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
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
  size?: 80 | 40
  className?: string
}

/** 図鑑の発見数に応じて育つキャラクター。ステージが上がった瞬間だけぴょんと跳ねる。 */
export function TaneCharacter({ count, size = 80, className }: Props) {
  const stage = stageFromCount(count)
  const prevStage = useRef(stage)
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    if (stage > prevStage.current) {
      setBounce(true)
      const timer = setTimeout(() => setBounce(false), 400)
      prevStage.current = stage
      return () => clearTimeout(timer)
    }
    prevStage.current = stage
  }, [stage])

  return (
    <motion.img
      src={`/images/tane/stage${stage}.jpg`}
      alt={STAGE_ALT[stage]}
      width={size}
      height={size}
      className={`shrink-0 rounded-xl ${className ?? ""}`}
      animate={bounce ? { scaleY: [1, 0.8, 1.2, 1] } : { scaleY: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    />
  )
}
