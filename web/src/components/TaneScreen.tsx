import { Star } from "lucide-react"
import type { ZukanEntry } from "../storage"

interface Props {
  zukan: ZukanEntry[]
  taneIds: number[]
  onBack: () => void
  onSelectJob: (jobId: number) => void
}

export function TaneScreen({ zukan, taneIds, onBack, onSelectJob }: Props) {
  const tane = zukan.filter((e) => taneIds.includes(e.jobId))

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm font-medium text-charcoal-muted transition hover:text-sage-700"
      >
        ← もどる
      </button>

      <h2 className="text-2xl font-bold tracking-tight">タネ</h2>
      <p className="text-sm text-charcoal-muted">気になる、と保存した仕事。</p>

      {tane.length === 0 ? (
        <p className="text-center text-charcoal-muted">
          まだタネがありません。見つけた仕事で「気になる」を押すと、ここに保存されます。
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {tane.map((entry) => (
            <button
              key={entry.jobId}
              type="button"
              onClick={() => onSelectJob(entry.jobId)}
              className="flex items-center gap-3 rounded-2xl border border-border-soft bg-white p-4 text-left transition hover:border-sage-600"
            >
              <Star className="h-5 w-5 shrink-0 text-sage-600" fill="currentColor" strokeWidth={1} />
              <div>
                <p className="font-bold">{entry.jobName}</p>
                <p className="mt-1 text-xs text-charcoal-muted">{entry.subject}をよく使う仕事</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
