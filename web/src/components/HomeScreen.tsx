import { Flame } from "lucide-react"
import { useState } from "react"

interface Props {
  subjects: string[]
  recordedToday: boolean
  streak: number
  totalMinutes: number
  zukanCount: number
  loading: boolean
  error: string | null
  onRecord: (subject: string, minutes: number) => void
  onOpenZukan: () => void
  onOpenTane: () => void
}

export function HomeScreen({
  subjects,
  recordedToday,
  streak,
  totalMinutes,
  zukanCount,
  loading,
  error,
  onRecord,
  onOpenZukan,
  onOpenTane,
}: Props) {
  const [subject, setSubject] = useState<string | null>(null)
  const [minutes, setMinutes] = useState("30")

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">夢のタネ</h1>
        <span className="flex items-center gap-1 text-sm font-medium text-charcoal-muted">
          <Flame className="h-4 w-4 text-coral-500" />
          {streak}日連続
        </span>
      </div>

      {recordedToday ? (
        <div className="rounded-2xl bg-sage-50 p-5 text-center">
          <p className="font-bold text-sage-700">今日はもう記録したよ</p>
          <p className="mt-1 text-sm text-charcoal-muted">また明日、勉強したら記録しよう</p>
          <p className="mt-2 text-xs text-charcoal-muted">これまでの合計 {totalMinutes}分</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-white p-5">
          <p className="font-bold">今日、何を勉強した？</p>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={
                  "rounded-xl border px-3 py-3 text-sm font-medium transition " +
                  (subject === s
                    ? "border-sage-600 bg-sage-50 text-sage-700"
                    : "border-border-soft bg-white text-charcoal hover:border-sage-600")
                }
              >
                {s}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 text-sm">
            <span className="text-charcoal-muted">勉強した時間</span>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-20 rounded-lg border border-border-soft px-3 py-2 text-right"
            />
            <span className="text-charcoal-muted">分</span>
          </label>

          {error && <p className="text-sm text-coral-600">{error}</p>}

          <button
            type="button"
            disabled={!subject || loading}
            onClick={() => subject && onRecord(subject, Number(minutes) || 0)}
            className="rounded-full bg-coral-500 py-3 text-center font-bold text-white transition active:bg-coral-600 disabled:opacity-40"
          >
            {loading ? "さがしています…" : "記録する"}
          </button>
        </div>
      )}

      <div className="mt-auto grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenZukan}
          className="rounded-2xl border border-border-soft bg-white py-4 text-center transition hover:border-sage-600"
        >
          <p className="text-lg font-bold">{zukanCount} / 167</p>
          <p className="text-xs text-charcoal-muted">職業図鑑</p>
        </button>
        <button
          type="button"
          onClick={onOpenTane}
          className="rounded-2xl border border-border-soft bg-white py-4 text-center transition hover:border-sage-600"
        >
          <p className="text-lg font-bold">タネ</p>
          <p className="text-xs text-charcoal-muted">気になる仕事</p>
        </button>
      </div>
    </div>
  )
}
