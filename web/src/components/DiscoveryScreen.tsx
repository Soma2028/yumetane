import { Star } from "lucide-react"
import { iconForTags } from "../tagIcons"
import type { Job } from "../types"

interface Props {
  job: Job | null
  exhausted: boolean
  subject: string
  isTane: boolean
  onToggleTane: () => void
  onDone: () => void
}

export function DiscoveryScreen({ job, exhausted, subject, isTane, onToggleTane, onDone }: Props) {
  if (exhausted || !job) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="text-xl font-bold tracking-tight">
          {subject}の仕事はぜんぶ見つけたよ
        </h2>
        <p className="text-sm leading-relaxed text-charcoal-muted">
          他の教科も勉強してみると、また新しい仕事に出会えるかも。
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-4 rounded-full bg-sage-600 px-8 py-3 font-bold text-white transition active:bg-sage-700"
        >
          ホームにもどる
        </button>
      </div>
    )
  }

  const Icon = iconForTags(job.tags)

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <p className="text-center text-sm font-medium text-charcoal-muted">
        {subject}を勉強して、新しい仕事が見つかったよ
      </p>

      <div className="overflow-hidden rounded-3xl border border-border-soft bg-white shadow-sm">
        <div className="flex h-40 items-center justify-center bg-sage-100">
          <Icon className="h-16 w-16 text-sage-600" strokeWidth={1.5} />
        </div>
        <div className="px-5 pt-4 pb-5">
          <h3 className="text-xl font-bold tracking-tight">{job.job_name}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-charcoal-muted">{job.description}</p>
          {job.riasec_source === "predicted" && (
            <span className="mt-2 inline-block rounded-full bg-notice-bg px-3 py-1 text-xs font-medium text-notice-text">
              まだデータが少ないから、仕事の内容から予想したよ
            </span>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-charcoal-muted">図鑑に登録したよ</p>

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

      <button
        type="button"
        onClick={onDone}
        className="rounded-full border border-border-soft py-3 text-center font-bold text-charcoal-muted transition active:bg-gray-100"
      >
        ホームにもどる
      </button>
    </div>
  )
}
