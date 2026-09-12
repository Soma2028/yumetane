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
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <p className="text-sm font-medium text-charcoal-muted">{cardNumber}枚目</p>
      {card ? (
        <SwipeCard card={card} likeButtonSide={likeButtonSide} onReact={onReact} />
      ) : (
        <p className="text-charcoal-muted">{loading ? "よみこみ中…" : ""}</p>
      )}
    </div>
  )
}
