import { SproutIcon } from "./SproutIcon"

interface Props {
  onStart: () => void
}

export function TopScreen({ onStart }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <SproutIcon className="h-12 w-12 text-sage-600" />
      <h1 className="text-4xl font-bold tracking-tight">夢のタネ</h1>
      <p className="max-w-xs text-base leading-loose text-charcoal-muted">
        今日勉強した教科を記録すると、その教科をよく使う仕事が見つかります。
        見つけた仕事は図鑑にたまっていきます。
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-2 rounded-full bg-coral-500 px-10 py-4 text-lg font-bold text-white shadow-sm transition active:bg-coral-600"
      >
        はじめる
      </button>
    </div>
  )
}
