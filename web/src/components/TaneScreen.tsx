import { Star } from "lucide-react"
import type { ZukanEntry } from "../storage"
import { BackButton } from "./BackButton"
import { Phrase } from "./Phrase"
import { motion } from "framer-motion"
import { cardInView } from "../motion"
import { SubjectDot } from "./SubjectDot"

interface Props {
  zukan: ZukanEntry[]
  taneIds: number[]
  onBack: () => void
  onSelectJob: (jobId: number) => void
}

export function TaneScreen({ zukan, taneIds, onBack, onSelectJob }: Props) {
  const tane = zukan.filter((e) => taneIds.includes(e.jobId))

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10 lg:max-w-4xl lg:px-10">
      <BackButton onClick={onBack} />

      <div>
        <h2 className="ui-page-title">タネ</h2>
        <p className="mt-1 text-sm text-charcoal-muted">気になる、と保存した仕事。</p>
      </div>

      {tane.length === 0 ? (
        // 0件のときは、どのボタンを押せば保存されるかを、ボタンと同じ見た目で示す
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border-soft px-6 py-8 text-center">
          <p className="leading-relaxed text-charcoal-muted">
            <Phrase>まだタネがないよ。</Phrase>
            <Phrase>見つけた仕事の画面で、</Phrase>
            <Phrase>このボタンを押すと</Phrase>
            <Phrase>ここに集まるよ。</Phrase>
          </p>
          <span className="flex items-center gap-2 rounded-full border border-border-soft bg-white px-5 py-2.5 text-sm font-bold text-charcoal-muted">
            <Star className="h-4 w-4" strokeWidth={1.5} />
            気になる（タネに保存）
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2">
          {tane.map((entry, i) => (
            <motion.button
              {...cardInView(i)}
              key={entry.jobId}
              type="button"
              onClick={() => onSelectJob(entry.jobId)}
              className="ui-card flex gap-3 p-4 text-left transition hover:border-sage-600"
            >
              <Star className="mt-0.5 h-5 w-5 shrink-0 text-sage-600" fill="currentColor" strokeWidth={1} />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{entry.jobName}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-charcoal-muted">
                  <SubjectDot subject={entry.subject} className="h-2 w-2" />
                  {entry.subject}をよく使う仕事
                </p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="ui-tag"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {entry.description && (
                  <p className="mt-2 truncate text-xs text-charcoal-muted">{entry.description}</p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
