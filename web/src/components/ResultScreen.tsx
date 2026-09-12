import type { Job } from "../types"

interface Props {
  explanation: string
  jobs: Job[]
  knownJobIds: number[]
  onMarkKnown: (jobId: number) => void
  onSelectJob: (job: Job) => void
}

export function ResultScreen({ explanation, jobs, knownJobIds, onMarkKnown, onSelectJob }: Props) {
  const displayed = jobs.filter((j) => !knownJobIds.includes(j.job_id)).slice(0, 5)

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <h2 className="text-2xl font-bold">あなたに合いそうな職業</h2>
      <p className="text-gray-600">{explanation}</p>

      {displayed.length === 0 && (
        <p className="text-gray-500">紹介できる職業が無くなりました。</p>
      )}

      <div className="flex flex-col gap-4">
        {displayed.map((job) => (
          <div
            key={job.job_id}
            className="rounded-2xl border border-gray-300 bg-white p-4"
          >
            <button
              type="button"
              onClick={() => onSelectJob(job)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{job.job_name}</span>
                {job.riasec_source === "predicted" && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                    まだデータが少ないから、仕事の内容から予想したよ
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{job.description}</p>
            </button>
            <button
              type="button"
              onClick={() => onMarkKnown(job.job_id)}
              className="mt-3 text-sm text-gray-500 underline"
            >
              これ知ってる
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
