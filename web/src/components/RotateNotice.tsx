import { Smartphone } from "lucide-react"

/**
 * スマホを横にしたときに、縦に戻すよう案内する。iPhoneのWebアプリは画面の向きを固定できない
 * （manifestのorientationが効かず、screen.orientation.lock()も使えない）ため、横向きでは
 * 画面全体をこの案内で覆う。タブレットやパソコンには出さないよう、高さの低い・指で操作する
 * 画面の横向きのときだけ出す（CSSのメディアクエリで切り替えるので、JSの判定はしない）。
 */
export function RotateNotice() {
  return (
    <div
      role="alert"
      className="fixed inset-0 z-50 hidden flex-col items-center justify-center gap-3 bg-cream px-6 text-center [@media(orientation:landscape)_and_(max-height:500px)_and_(pointer:coarse)]:flex"
    >
      <Smartphone className="h-10 w-10 text-sage-600" strokeWidth={1.75} />
      <p className="font-bold">スマホを縦にして使ってね</p>
      <p className="text-sm text-charcoal-muted">夢のタネは縦向きの画面で作っているよ</p>
    </div>
  )
}
