import type { Question } from "../types"

interface Props {
  question: Question
  currentIndex: number
  total: number
  onAnswer: (choiceText: string) => void
}

export function QuestionScreen({ question, currentIndex, total, onAnswer }: Props) {
  const progress = ((currentIndex + 1) / total) * 100

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-2 flex justify-between text-sm font-medium text-charcoal-muted">
          <span>
            {currentIndex + 1} / {total}問
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-sage-100">
          <div
            className="h-2 rounded-full bg-sage-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="text-sm font-medium text-charcoal-muted">どちらが自分に近い？</p>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <button
          type="button"
          onClick={() => onAnswer(question.choice_1)}
          className="rounded-2xl border border-border-soft bg-white p-5 text-left text-lg leading-snug transition hover:border-sage-600 hover:bg-sage-50 active:scale-[0.98] active:border-sage-600 active:bg-sage-50"
        >
          {question.choice_1}
        </button>
        <button
          type="button"
          onClick={() => onAnswer(question.choice_2)}
          className="rounded-2xl border border-border-soft bg-white p-5 text-left text-lg leading-snug transition hover:border-sage-600 hover:bg-sage-50 active:scale-[0.98] active:border-sage-600 active:bg-sage-50"
        >
          {question.choice_2}
        </button>
      </div>
    </div>
  )
}
