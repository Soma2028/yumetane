interface Props {
  explanation: string
  onContinue: () => void
  onSeeResult: () => void
}

export function MidResultScreen({ explanation, onContinue, onSeeResult }: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <h2 className="text-2xl font-bold tracking-tight">今のところ、こんな傾向かも</h2>
      <p className="text-base leading-loose text-charcoal-muted">{explanation}</p>
      <div className="mt-4 flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-full bg-sage-600 px-6 py-3 font-bold text-white transition active:bg-sage-700"
        >
          もう少し見てみる
        </button>
        <button
          type="button"
          onClick={onSeeResult}
          className="rounded-full border border-border-soft px-6 py-3 font-bold text-charcoal-muted transition active:bg-gray-100"
        >
          結果を見る
        </button>
      </div>
    </div>
  )
}
