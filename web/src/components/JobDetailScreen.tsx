import type { Job } from "../types"

interface Props {
  job: Job
  onBack: () => void
}

export function JobDetailScreen({ job, onBack }: Props) {
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
      {job.riasec_source === "predicted" && (
        <span className="w-fit rounded-full bg-notice-bg px-3 py-1 text-xs font-medium text-notice-text">
          まだデータが少ないから、仕事の内容から予想したよ
        </span>
      )}
      <p className="text-base leading-loose text-charcoal">{job.description}</p>
    </div>
  )
}
