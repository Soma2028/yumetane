import { ExternalLink, Star } from "lucide-react"
import type { Job } from "../types"
import { BackButton } from "./BackButton"
import { SubjectDot } from "./SubjectDot"

interface Props {
  job: Job
  subject?: string
  isTane: boolean
  onToggleTane: () => void
  onBack: () => void
}

export function JobDetailScreen({ job, subject, isTane, onToggleTane, onBack }: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10 lg:max-w-2xl lg:py-14">
      <BackButton onClick={onBack} />
      <h2 className="ui-page-title">{job.job_name}</h2>

      {subject && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-sage-700">
          <SubjectDot subject={subject} />
          この仕事は{subject}をよく使う
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="ui-tag"
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

      {/* もっと知りたくなったときの行き先。説明文はjob tagの要約なので、写真・動画・
          なり方まで載っている元のページへ渡す */}
      <a
        href={job.jobtag_url}
        target="_blank"
        rel="noopener noreferrer"
        className="ui-card flex items-center justify-between gap-3 px-5 py-4 transition hover:border-sage-600"
      >
        <span>
          <span className="block font-bold">写真や動画でもっと知る</span>
          <span className="text-xs text-charcoal-muted">job tag（厚生労働省の職業情報サイト）</span>
        </span>
        <ExternalLink className="h-5 w-5 shrink-0 text-sage-600" strokeWidth={1.5} />
      </a>

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
