import { motion } from "framer-motion"
import { ChevronRight, Flame } from "lucide-react"
import { useState } from "react"
import type { RecordDetails, StudyLogEntry } from "../storage"
import { TaneCharacter } from "./TaneCharacter"
import { TaneSpeech } from "./TaneSpeech"

const MEMO_MAX_LENGTH = 100

interface Props {
  subjects: string[]
  todaysLogs: StudyLogEntry[]
  todaysTotalMinutes: number
  streak: number
  zukanCount: number
  todaysDiscoveredJob: { jobId: number; jobName: string } | null
  toast: string | null
  loading: boolean
  error: string | null
  onRecord: (subject: string, minutes: number, details: RecordDetails) => void
  onOpenZukan: () => void
  onOpenTane: () => void
  onSelectJob: (jobId: number) => void
}

export function HomeScreen({
  subjects,
  todaysLogs,
  todaysTotalMinutes,
  streak,
  zukanCount,
  todaysDiscoveredJob,
  toast,
  loading,
  error,
  onRecord,
  onOpenZukan,
  onOpenTane,
  onSelectJob,
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState<string | null>(null)
  const [minutesInput, setMinutesInput] = useState("30")
  const [material, setMaterial] = useState("")
  const [content, setContent] = useState("")
  const [memo, setMemo] = useState("")

  const minutes = Number(minutesInput) || 0
  const canSubmit = subject !== null && minutes >= 10

  function handleSubmit() {
    if (!canSubmit || !subject) return
    onRecord(subject, minutes, { material, content, memo })
    setSubject(null)
    setMinutesInput("30")
    setMaterial("")
    setContent("")
    setMemo("")
    setShowForm(false)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-6 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TaneCharacter count={zukanCount} size={40} />
          <h1 className="text-2xl font-bold tracking-tight">夢のタネ</h1>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-charcoal-muted">
          <motion.span
            className="inline-block"
            style={{ transformOrigin: "50% 90%" }}
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Flame className="h-4 w-4 text-coral-500" />
          </motion.span>
          {streak}日連続
        </span>
      </div>

      {todaysDiscoveredJob && (
        <button
          type="button"
          onClick={() => onSelectJob(todaysDiscoveredJob.jobId)}
          className="flex items-center justify-between rounded-xl bg-sage-50 px-4 py-2.5 text-left text-sm font-medium text-sage-700 transition hover:bg-sage-100"
        >
          <span>今日見つけた仕事：{todaysDiscoveredJob.jobName}</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>
      )}

      <div className="flex flex-col gap-4 rounded-3xl border border-border-soft bg-white p-5 shadow-[0_4px_16px_rgba(47,107,79,0.08)]">
        <div className="flex items-center justify-between">
          <p className="font-bold">今日の記録</p>
          {todaysLogs.length > 0 && (
            <p className="text-sm text-charcoal-muted">合計 {todaysTotalMinutes}分</p>
          )}
        </div>

        {todaysLogs.length === 0 ? (
          <p className="text-sm text-charcoal-muted">まだ記録がありません</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todaysLogs.map((log, i) => (
              <li
                key={i}
                className="rounded-3xl border border-border-soft bg-cream px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between font-medium">
                  <span>{log.subject}</span>
                  <span className="text-charcoal-muted">{log.minutes}分</span>
                </div>
                {(log.material || log.content) && (
                  <p className="mt-1 text-xs text-charcoal-muted">
                    {[log.material, log.content].filter(Boolean).join(" ・ ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {toast && (
          <div className="flex items-start gap-2">
            <TaneCharacter count={zukanCount} size={40} />
            <TaneSpeech lines={[toast]} className="flex-1" />
          </div>
        )}

        {error && <p className="text-sm text-coral-600">{error}</p>}

        {showForm ? (
          <div className="flex flex-col gap-4 border-t border-border-soft pt-4">
            <div className="grid grid-cols-2 gap-2">
              {subjects.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  animate={subject === s ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={
                    "rounded-xl border px-3 py-3 text-sm font-medium transition-colors " +
                    (subject === s
                      ? "border-coral-500 bg-coral-500 text-white"
                      : "border-border-soft bg-white text-charcoal hover:border-sage-600")
                  }
                >
                  {s}
                </motion.button>
              ))}
            </div>

            <label className="flex items-center gap-3 text-sm">
              <span className="text-charcoal-muted">勉強した時間</span>
              <input
                type="number"
                min={1}
                value={minutesInput}
                onChange={(e) => setMinutesInput(e.target.value)}
                className="w-20 rounded-lg border border-border-soft px-3 py-2 text-right"
              />
              <span className="text-charcoal-muted">分</span>
            </label>

            {minutes > 0 && minutes < 10 && (
              <p className="text-xs text-coral-600">10分未満は記録できません</p>
            )}

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-charcoal-muted">教材名（任意）</span>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="例：チャート式"
                className="rounded-lg border border-border-soft px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-charcoal-muted">単元・内容（任意）</span>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="例：二次方程式"
                className="rounded-lg border border-border-soft px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="flex items-center justify-between text-charcoal-muted">
                <span>メモ（任意）</span>
                <span className="text-xs">
                  {memo.length} / {MEMO_MAX_LENGTH}
                </span>
              </span>
              <input
                type="text"
                value={memo}
                maxLength={MEMO_MAX_LENGTH}
                onChange={(e) => setMemo(e.target.value.slice(0, MEMO_MAX_LENGTH))}
                placeholder="例：やっと解けた"
                className="rounded-lg border border-border-soft px-3 py-2"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-full border border-border-soft py-3 text-center font-bold text-charcoal-muted transition active:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!canSubmit || loading}
                onClick={handleSubmit}
                className="flex-1 rounded-full bg-coral-500 py-3 text-center font-bold text-white transition active:bg-coral-600 disabled:opacity-40"
              >
                {loading ? "さがしています…" : "記録する"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-full bg-coral-500 py-3 text-center font-bold text-white transition active:bg-coral-600"
          >
            ＋ 記録を追加する
          </button>
        )}
      </div>

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
