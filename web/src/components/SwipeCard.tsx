import { useRef, useState } from "react"
import type { Job, SwipeDirection } from "../types"

interface Props {
  card: Job
  likeButtonSide: "left" | "right"
  onReact: (direction: SwipeDirection) => void
}

const SWIPE_THRESHOLD = 100

export function SwipeCard({ card, likeButtonSide, onReact }: Props) {
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
  const likeOpacity = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1)
  const nopeOpacity = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1)

  const knownButton = (
    <button
      type="button"
      onClick={() => onReact("right")}
      className="flex-1 rounded-full bg-sage-600 px-4 py-3 font-bold text-white transition active:bg-sage-700"
    >
      気になる
    </button>
  )
  const skipButton = (
    <button
      type="button"
      onClick={() => onReact("left")}
      className="flex-1 rounded-full border border-border-soft px-4 py-3 font-bold text-charcoal-muted transition active:bg-gray-100"
    >
      ちがう
    </button>
  )

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <div className="relative w-full touch-none select-none">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            transition: dragging ? "none" : "transform 0.25s ease-out",
          }}
          className="relative flex min-h-[360px] cursor-grab flex-col justify-center gap-4 rounded-3xl border border-border-soft bg-white p-6 shadow-sm active:cursor-grabbing"
        >
          <span
            style={{ opacity: likeOpacity }}
            className="absolute top-4 left-4 rounded-full border-2 border-sage-600 px-3 py-1 text-sm font-bold text-sage-600"
          >
            気になる
          </span>
          <span
            style={{ opacity: nopeOpacity }}
            className="absolute top-4 right-4 rounded-full border-2 border-charcoal-muted px-3 py-1 text-sm font-bold text-charcoal-muted"
          >
            ちがう
          </span>
          <h3 className="text-center text-2xl font-bold tracking-tight">{card.job_name}</h3>
          <p className="text-center text-base leading-loose text-charcoal-muted">
            {card.description}
          </p>
          {card.riasec_source === "predicted" && (
            <span className="mx-auto w-fit rounded-full bg-notice-bg px-3 py-1 text-xs font-medium text-notice-text">
              まだデータが少ないから、仕事の内容から予想したよ
            </span>
          )}
        </div>
      </div>

      <div className="flex w-full gap-4">
        {likeButtonSide === "left" ? (
          <>
            {knownButton}
            {skipButton}
          </>
        ) : (
          <>
            {skipButton}
            {knownButton}
          </>
        )}
      </div>
    </div>
  )
}
