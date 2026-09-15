import { Star } from "lucide-react"
import type { Job } from "../types"

interface Props {
  job: Job
  subject?: string
  isTane: boolean
  onToggleTane: () => void
  onBack: () => void
}

export function JobDetailScreen({ job, subject, isTane, onToggleTane, onBack }: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-6 py-10">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm font-medium text-charcoal-muted transition hover:text-sage-700"
      >
        ← もどる
      </button>
      <h2 className="text-2xl font-bold tracking-tight">{job.job_name}</h2>

      {subject && (
        <p className="text-sm font-medium text-sage-700">この仕事は{subject}をよく使う</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700"
          >
            {tag}
          </span>
        ))}
      </div>
      {job.riasec_source === "predicted" && (
        <span className="w-fit rounded-full bg-notice-bg px-3 py-1 text-xs font-medium text-notice-text">
          まだデータが少ないから、仕事の内容から予想したよ
        </span>
      )}
      <p className="text-base leading-loose text-charcoal">{job.description}</p>

      <button
        type="button"
        onClick={onToggleTane}
        className={
          "flex items-center justify-center gap-2 rounded-full py-3 font-bold transition " +
          (isTane
            ? "bg-sage-600 text-white active:bg-sage-700"
            : "border border-border-soft text-charcoal-muted active:bg-gray-100")
        }
      >
        <Star className="h-5 w-5" fill={isTane ? "currentColor" : "none"} strokeWidth={1.5} />
        {isTane ? "タネに保存したよ" : "気になる（タネに保存）"}
      </button>
    </div>
  )
}
