interface Props {
  loading: boolean
  error: string | null
  onStart: () => void
}

export function TopScreen({ loading, error, onStart }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold">夢のタネ</h1>
      <p className="max-w-md text-gray-600">
        10個の質問に答えると、あなたの興味に合いそうな職業を紹介します。
        知らなかった職業に出会えるかもしれません。
      </p>
      {error && <p className="text-red-600">{error}</p>}
      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        className="rounded-full bg-indigo-600 px-8 py-3 text-lg font-semibold text-white disabled:opacity-50"
      >
        {loading ? "よみこみ中..." : "はじめる"}
      </button>
    </div>
  )
}
