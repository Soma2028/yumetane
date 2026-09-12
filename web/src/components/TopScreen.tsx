import { SproutIcon } from "./SproutIcon"

interface Props {
  loading: boolean
  error: string | null
  onStart: () => void
}

export function TopScreen({ loading, error, onStart }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <SproutIcon className="h-12 w-12 text-sage-600" />
      <h1 className="text-4xl font-bold tracking-tight">夢のタネ</h1>
      <p className="max-w-xs text-base leading-loose text-charcoal-muted">
        10個の質問に答えると、あなたの興味に近い仕事を紹介します。
        まだ知らない仕事に出会えるかもしれません。
      </p>
      {error && <p className="text-coral-600">{error}</p>}
      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        className="mt-2 rounded-full bg-coral-500 px-10 py-4 text-lg font-bold text-white shadow-sm transition active:bg-coral-600 disabled:opacity-50"
      >
        {loading ? "よみこみ中…" : "はじめる"}
      </button>
    </div>
  )
}
