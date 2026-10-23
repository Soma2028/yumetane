import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, X } from "lucide-react"
import { useEffect, useState } from "react"
import type { RecordDetails } from "../storage"
import { DURATION, EASE_OUT, baseTransition } from "../motion"
import { subjectColor } from "../subjectColors"
import { SubjectDot } from "./SubjectDot"

const MEMO_MAX_LENGTH = 100
const LABEL_MAX_LENGTH = 40

interface Props {
  open: boolean
  subjects: string[]
  loading: boolean
  onSubmit: (subject: string, minutes: number, details: RecordDetails) => void
  onClose: () => void
}

/**
 * 勉強を記録する入力パネル。ホームの途中に縦長に開いていたときはスクロールが必要だったため、
 * 画面下からせり上がる1枚にまとめ、スクロールせずに記録できる高さに収める。
 * 教材・単元・メモは任意なので、押したときだけ開く。
 */
export function RecordSheet({ open, subjects, loading, onSubmit, onClose }: Props) {
  const [subject, setSubject] = useState<string | null>(null)
  const [minutesInput, setMinutesInput] = useState("30")
  const [showDetails, setShowDetails] = useState(false)
  const [material, setMaterial] = useState("")
  const [content, setContent] = useState("")
  const [memo, setMemo] = useState("")

  const minutes = Number(minutesInput) || 0
  const canSubmit = subject !== null && minutes >= 10

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  function reset() {
    setSubject(null)
    setMinutesInput("30")
    setShowDetails(false)
    setMaterial("")
    setContent("")
    setMemo("")
  }

  function handleSubmit() {
    if (!canSubmit || !subject) return
    onSubmit(subject, minutes, { material, content, memo })
    reset()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-30 flex items-end justify-center lg:items-center">
          <motion.button
            type="button"
            aria-label="記録をやめる"
            data-no-tap
            onClick={onClose}
            // 暗い幕だと、iOS 26のSafariが画面端に固定された要素の背景色で上下のバーを塗るため、
            // 開閉の瞬間に上が黒くなる。背景と同じクリーム色を半透明で重ね、少しぼかす
            className="absolute inset-0 bg-cream/75 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={baseTransition}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="今日の勉強を記録する"
            className="relative flex max-h-[92dvh] w-full max-w-md flex-col gap-4 overflow-y-auto overscroll-contain rounded-t-3xl bg-white px-5 pt-4 lg:max-w-lg lg:rounded-3xl lg:px-7 lg:pt-6 lg:pb-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] border border-border-soft shadow-[0_-8px_40px_rgba(43,38,32,0.18)] lg:shadow-[0_16px_48px_rgba(43,38,32,0.18)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={baseTransition}
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">今日の勉強を記録</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="閉じる"
                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-charcoal-muted transition hover:bg-cream"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="mb-2 text-sm text-charcoal-muted">教科</p>
              <div className="grid grid-cols-3 gap-2">
                {subjects.map((s) => (
                  <motion.button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    aria-pressed={subject === s}
                    animate={subject === s ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                    transition={{ duration: DURATION.tap, ease: EASE_OUT }}
                    // 選んだ教科は、その教科の色の背景と枠にする（白い文字は使わない）
                    className={
                      "h-11 rounded-xl border-2 px-1 text-sm font-medium transition-colors " +
                      (subject === s ? "font-bold" : "border-border-soft bg-white text-charcoal hover:border-sage-600")
                    }
                    style={
                      subject === s
                        ? { backgroundColor: subjectColor(s).bg, borderColor: subjectColor(s).solid, color: subjectColor(s).text }
                        : undefined
                    }
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <SubjectDot subject={s} />
                      {s}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 text-sm">
                <span className="text-charcoal-muted">勉強した時間</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={minutesInput}
                  onChange={(e) => setMinutesInput(e.target.value)}
                  className="w-20 rounded-lg border border-border-soft px-3 py-2 text-right"
                />
                <span className="text-charcoal-muted">分</span>
              </label>
              {minutes > 0 && minutes < 10 && (
                <p className="mt-2 rounded-lg bg-notice-bg px-3 py-2 text-xs text-notice-text">
                  10分未満は記録できません
                </p>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                aria-expanded={showDetails}
                className="flex items-center gap-1 text-sm font-medium text-sage-700"
              >
                ＋ 教材・単元・メモ（任意）
                <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
              </button>
              {showDetails && (
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    type="text"
                    aria-label="教材名（任意）"
                    value={material}
                    maxLength={LABEL_MAX_LENGTH}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="教材名　例：チャート式"
                    className="rounded-lg border border-border-soft px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    aria-label="単元・内容（任意）"
                    value={content}
                    maxLength={LABEL_MAX_LENGTH}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="単元・内容　例：二次方程式"
                    className="rounded-lg border border-border-soft px-3 py-2 text-sm"
                  />
                  <label className="flex flex-col gap-1 text-sm">
                    <input
                      type="text"
                      aria-label="メモ（任意）"
                      value={memo}
                      maxLength={MEMO_MAX_LENGTH}
                      onChange={(e) => setMemo(e.target.value.slice(0, MEMO_MAX_LENGTH))}
                      placeholder="メモ　例：やっと解けた"
                      className="rounded-lg border border-border-soft px-3 py-2"
                    />
                    <span className="self-end text-xs text-charcoal-muted">
                      {memo.length} / {MEMO_MAX_LENGTH}
                    </span>
                  </label>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
              className="rounded-full bg-coral-500 py-3.5 text-center text-lg font-bold text-white transition active:bg-coral-600 disabled:opacity-40"
            >
              {loading ? "さがしています…" : subject ? `${subject}を記録する` : "教科をえらんでね"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
