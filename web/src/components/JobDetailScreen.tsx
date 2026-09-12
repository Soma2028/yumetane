import type { Job } from "../types"

interface Props {
  job: Job
  onBack: () => void
}

export function JobDetailScreen({ job, onBack }: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <button type="button" onClick={onBack} className="self-start text-sm text-gray-500">
        ← もどる
      </button>
      <h2 className="text-2xl font-bold">{job.job_name}</h2>
      {job.riasec_source === "predicted" && (
        <span className="w-fit rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
          まだデータが少ないから、仕事の内容から予想したよ
        </span>
      )}
      <p className="text-gray-700">{job.description}</p>
    </div>
  )
}
