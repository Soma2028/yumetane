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
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="w-full max-w-md">
        <div className="mb-2 flex justify-between text-sm text-gray-500">
          <span>
            {currentIndex + 1} / {total}問
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        <button
          type="button"
          onClick={() => onAnswer(question.choice_1)}
          className="rounded-2xl border border-gray-300 bg-white p-5 text-left text-lg hover:border-indigo-500 hover:bg-indigo-50"
        >
          {question.choice_1}
        </button>
        <button
          type="button"
          onClick={() => onAnswer(question.choice_2)}
          className="rounded-2xl border border-gray-300 bg-white p-5 text-left text-lg hover:border-indigo-500 hover:bg-indigo-50"
        >
          {question.choice_2}
        </button>
      </div>
    </div>
  )
}
