import type { ZukanEntry } from "../storage"

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm font-medium text-charcoal-muted transition hover:text-sage-700"
      >
        ← もどる
      </button>

      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">職業図鑑</h2>
        <p className="mt-1 text-charcoal-muted">
          {zukan.length} / {total} 見つけた
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-3xl border border-border-soft bg-white p-4 shadow-[0_4px_16px_rgba(47,107,79,0.08)]">
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
                  className="h-2 rounded-full bg-gradient-to-r from-sage-600 to-coral-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-charcoal-muted">
          まだ何も見つかっていません。ホームから勉強を記録しよう。
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((entry) => (
            <button
              key={entry.jobId}
              type="button"
              onClick={() => onSelectJob(entry.jobId)}
              className="rounded-3xl border border-border-soft bg-white p-4 text-left shadow-[0_4px_16px_rgba(47,107,79,0.08)] transition hover:border-sage-600"
            >
              <p className="font-bold">{entry.jobName}</p>
              <p className="mt-1 text-xs text-charcoal-muted">
                {entry.subject}の勉強から見つけた・{entry.area}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
