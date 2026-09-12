import { Star, X } from "lucide-react"
import { SwipeCard } from "./SwipeCard"
import type { Job, SwipeDirection } from "../types"

interface Props {
  card: Job | null
  cardNumber: number
  likeButtonSide: "left" | "right"
  loading: boolean
  onReact: (direction: SwipeDirection) => void
}

export function SwipeScreen({ card, cardNumber, likeButtonSide, loading, onReact }: Props) {
  const interestedButton = (
    <button
      type="button"
      onClick={() => onReact("right")}
      aria-label="気になる"
      className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full bg-sage-600 text-white shadow-sm transition active:bg-sage-700"
    >
      <Star className="h-7 w-7" fill="currentColor" strokeWidth={1} />
    </button>
  )
  const notForMeButton = (
    <button
      type="button"
      onClick={() => onReact("left")}
      aria-label="ちがうかも"
      className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border border-border-soft bg-white text-charcoal-muted shadow-sm transition active:bg-gray-100"
    >
      <X className="h-7 w-7" strokeWidth={2} />
    </button>
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <p className="text-sm font-medium text-charcoal-muted">{cardNumber}枚目</p>

      <div className="w-full max-w-sm">
        {card ? (
          <SwipeCard card={card} onReact={onReact} />
        ) : (
          <p className="py-20 text-center text-charcoal-muted">{loading ? "よみこみ中…" : ""}</p>
        )}
      </div>

      <div className="flex items-center gap-8">
        {likeButtonSide === "left" ? (
          <>
            <div className="flex flex-col items-center gap-1.5">
              {interestedButton}
              <span className="text-xs font-medium text-charcoal-muted">気になる</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              {notForMeButton}
              <span className="text-xs font-medium text-charcoal-muted">ちがうかも</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1.5">
              {notForMeButton}
              <span className="text-xs font-medium text-charcoal-muted">ちがうかも</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              {interestedButton}
              <span className="text-xs font-medium text-charcoal-muted">気になる</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
