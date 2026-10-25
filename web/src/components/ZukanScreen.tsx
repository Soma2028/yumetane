import type { ZukanEntry } from "../storage"
import { BackButton } from "./BackButton"
import { Phrase } from "./Phrase"
import { motion } from "framer-motion"
import { cardInView } from "../motion"
import { SubjectDot } from "./SubjectDot"

interface Props {
  zukan: ZukanEntry[]
  areaTotals: Record<string, number>
  onBack: () => void
  onSelectJob: (jobId: number) => void
}

export function ZukanScreen({ zukan, areaTotals, onBack, onSelectJob }: Props) {
  const total = Object.values(areaTotals).reduce((a, b) => a + b, 0) || 167

  const knownByArea: Record<string, number> = {}
  for (const entry of zukan) {
    knownByArea[entry.area] = (knownByArea[entry.area] ?? 0) + 1
  }

  const sorted = [...zukan].sort((a, b) => b.discoveredAt.localeCompare(a.discoveredAt))

  return (
    // パソコン（lg以上）は、左にタイトルとエリアの進み具合（スクロールしても残す）、
    // 右に見つけた職業を2列で並べる
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10 lg:grid lg:max-w-6xl lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-x-10 lg:px-10">
      <BackButton onClick={onBack} className="sticky top-3 z-10 self-start justify-self-start lg:col-span-2" />

      <div className="flex flex-col gap-6 lg:sticky lg:top-20">
      <div>
        <h2 className="ui-page-title">職業図鑑</h2>
        <p className="mt-1 text-charcoal-muted">
          {zukan.length} / {total} 見つけた
        </p>
      </div>

      <motion.div
        {...cardInView(0)}
        className="ui-card flex flex-col gap-2 p-4"
      >
        {Object.entries(areaTotals).map(([area, areaTotal]) => {
          const known = knownByArea[area] ?? 0
          const pct = areaTotal > 0 ? Math.round((known / areaTotal) * 100) : 0
          return (
            <div key={area}>
              <div className="flex justify-between text-xs text-charcoal-muted">
                <span>{area}</span>
                <span>
                  {known} / {areaTotal}
                </span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-sage-50">
                <div
                  className="h-2 rounded-full bg-sage-600 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </motion.div>

      </div>

      {sorted.length === 0 ? (
        // 0件のときは、次に何をすればいいかと、その場所への導線を出す
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border-soft px-6 py-8 text-center">
          <p className="leading-relaxed text-charcoal-muted">
            <Phrase>まだ何も見つかっていないよ。</Phrase>
            <Phrase>勉強を記録すると、</Phrase>
            <Phrase>その教科をよく使う仕事が</Phrase>
            <Phrase>ひとつずつ集まっていくよ。</Phrase>
          </p>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full bg-coral-500 px-8 py-3 font-bold text-white transition active:bg-coral-600"
          >
            ホームで記録する
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2">
          {sorted.map((entry, i) => (
            <motion.button
              {...cardInView(i + 1)}
              key={entry.jobId}
              type="button"
              onClick={() => onSelectJob(entry.jobId)}
              className="ui-card p-4 text-left transition hover:border-sage-600"
            >
              <p className="font-bold">{entry.jobName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-charcoal-muted">
                <span className="flex items-center gap-1">
                  <SubjectDot subject={entry.subject} className="h-2 w-2" />
                  {entry.subject}の勉強から見つけた
                </span>
                <span className="ui-tag">
                  {entry.area}
                </span>
              </div>
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
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
