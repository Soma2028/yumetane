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
      <h2 className="text-2xl font-bold tracking-tight">気になる仕事、見つかった？</h2>

      <div className="rounded-2xl bg-sage-50 p-4 text-sm leading-relaxed text-sage-700">
        見たことのない名前が並んでいるかもしれません。夢のタネは、知らない仕事に
        わざと多めに出会えるようにしています。知らない名前ばかりで大丈夫です。
      </div>

      <p className="text-sm leading-relaxed text-charcoal-muted">
        あなたの答えからは、{explanation}
      </p>

      {displayed.length === 0 && (
        <p className="text-charcoal-muted">紹介できる仕事が無くなりました。</p>
      )}

      <div className="flex flex-col gap-4">
        {displayed.map((job) => (
          <div
            key={job.job_id}
            className="rounded-2xl border border-border-soft bg-white p-4"
          >
            <button
              type="button"
              onClick={() => onSelectJob(job)}
              className="w-full text-left"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold">{job.job_name}</span>
                {job.riasec_source === "predicted" && (
                  <span className="rounded-full bg-notice-bg px-2 py-0.5 text-xs font-medium text-notice-text">
                    まだデータが少ないから、仕事の内容から予想したよ
                  </span>
                )}
              </div>
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
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-charcoal-muted">
                {job.description}
              </p>
            </button>
            <button
              type="button"
              onClick={() => onMarkKnown(job.job_id)}
              className="mt-3 rounded-full border border-border-soft px-3 py-1.5 text-xs font-medium text-charcoal-muted transition hover:border-sage-600 hover:text-sage-700"
            >
              これ知ってる
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
