import { ChevronLeft } from "lucide-react"

interface Props {
  onClick: () => void
  className?: string
}

/**
 * 各画面の左上に置く「もどる」。指で押しやすいよう高さ44pxの白いピル型にし、
 * 図鑑やきろくのような長い画面でもスクロールせずに戻れるよう上端に貼り付ける
 * （配置を上書きしたい画面はclassNameで渡す）。
 */
export function BackButton({ onClick, className = "sticky top-3 z-10 self-start" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} flex h-11 items-center gap-0.5 rounded-full border border-border-soft bg-white/90 pr-4 pl-2.5 text-base font-bold text-charcoal shadow-sm backdrop-blur transition active:scale-95 active:bg-sage-50`}
    >
      <ChevronLeft className="h-5 w-5" strokeWidth={2} />
      もどる
    </button>
  )
}
