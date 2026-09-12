import { useRef, useState } from "react"
import { iconForTags } from "../tagIcons"
import type { Job, SwipeDirection } from "../types"

interface Props {
  card: Job
  onReact: (direction: SwipeDirection) => void
}

const SWIPE_THRESHOLD = 100

export function SwipeCard({ card, onReact }: Props) {
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true)
    startX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return
    setDragX(e.clientX - startX.current)
  }

  function handlePointerUp() {
    setDragging(false)
    if (dragX > SWIPE_THRESHOLD) {
      onReact("right")
    } else if (dragX < -SWIPE_THRESHOLD) {
      onReact("left")
    }
    setDragX(0)
  }

  const rotation = dragX / 18
  const interestedOpacity = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1)
  const notForMeOpacity = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1)
  const Icon = iconForTags(card.tags)

  return (
    <div className="relative w-full touch-none select-none">
      {/* 背後にもう1枚あることを示す、内容の無いカード（重なり表現） */}
      <div
        aria-hidden="true"
        className="absolute inset-x-4 top-4 h-full scale-[0.97] rounded-3xl border border-border-soft bg-white"
      />

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
          transition: dragging ? "none" : "transform 0.25s ease-out",
        }}
        className="relative flex cursor-grab flex-col overflow-hidden rounded-3xl border border-border-soft bg-white shadow-sm active:cursor-grabbing"
      >
        <span
          style={{ opacity: interestedOpacity }}
          className="absolute top-4 left-4 z-10 rounded-full border-2 border-sage-600 bg-white/90 px-3 py-1 text-sm font-bold text-sage-600"
        >
          気になる
        </span>
        <span
          style={{ opacity: notForMeOpacity }}
          className="absolute top-4 right-4 z-10 rounded-full border-2 border-charcoal-muted bg-white/90 px-3 py-1 text-sm font-bold text-charcoal-muted"
        >
          ちがうかも
        </span>

        {/* 画像プレースホルダー。実画像ができ次第、この領域を差し替える */}
        <div className="flex h-52 items-center justify-center bg-sage-100">
          <Icon className="h-20 w-20 text-sage-600" strokeWidth={1.5} />
        </div>

        {/* カード下部の情報パネル（職業名＋タグ）。画像に重ねるように配置 */}
        <div className="-mt-4 rounded-t-3xl bg-white px-5 pt-4 pb-5">
          <h3 className="text-xl font-bold tracking-tight">{card.job_name}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-charcoal-muted">
            {card.description}
          </p>
          {card.riasec_source === "predicted" && (
            <span className="mt-2 inline-block w-fit rounded-full bg-notice-bg px-3 py-1 text-xs font-medium text-notice-text">
              まだデータが少ないから、仕事の内容から予想したよ
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
