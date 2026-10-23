import { AnimatePresence, motion } from "framer-motion"
import { Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { baseTransition } from "../motion"
import { DAY_LABELS, PERIODS, SCHOOL_DAYS, TIMETABLE_SUBJECTS, shortSubject, type Timetable } from "../timetable"
import { BackButton } from "./BackButton"

interface Props {
  timetable: Timetable
  onChange: (day: number, period: number, subject: string | null) => void
  onBack: () => void
}

/** 月〜土 × 1〜6限の時間割。マスを押すと、下から出るパネルで教科を選ぶ。 */
export function TimetableScreen({ timetable, onChange, onBack }: Props) {
  const [editing, setEditing] = useState<{ day: number; period: number } | null>(null)
  const today = new Date().getDay()

  useEffect(() => {
    if (!editing) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setEditing(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [editing])

  function choose(subject: string | null) {
    if (!editing) return
    onChange(editing.day, editing.period, subject)
    setEditing(null)
  }

  const current = editing ? (timetable[editing.day]?.[editing.period] ?? null) : null

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-4 py-10 lg:max-w-3xl lg:px-10">
      <BackButton onClick={onBack} />

      <div className="px-2">
        <h2 className="text-2xl font-bold tracking-tight">時間割</h2>
        <p className="mt-1 text-sm text-charcoal-muted">マスを押して教科を入れてね。今日の分がホームに出るよ。</p>
      </div>

      <div className="rounded-3xl border border-border-soft bg-white p-3 lg:p-5">
        <div className="grid grid-cols-[1.5rem_repeat(6,minmax(0,1fr))] gap-1.5 lg:grid-cols-[2rem_repeat(6,minmax(0,1fr))] lg:gap-2">
          <span />
          {SCHOOL_DAYS.map((d) => (
            <span
              key={d}
              className={
                "py-1 text-center text-xs font-bold " + (d === today ? "rounded-full bg-sage-600 text-white" : "text-charcoal-muted")
              }
            >
              {DAY_LABELS[d]}
            </span>
          ))}
          {Array.from({ length: PERIODS }, (_, period) => (
            <Row key={period} period={period} timetable={timetable} today={today} onEdit={(day) => setEditing({ day, period })} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-30 flex items-end justify-center lg:items-center">
            <motion.button
              type="button"
              aria-label="閉じる"
              data-no-tap
              onClick={() => setEditing(null)}
              className="absolute inset-0 bg-cream/75 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={baseTransition}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${DAY_LABELS[editing.day]}曜 ${editing.period + 1}限の教科`}
              className="relative w-full max-w-md rounded-t-3xl border border-border-soft bg-white px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_40px_rgba(43,38,32,0.18)] lg:rounded-3xl lg:px-7 lg:pt-6 lg:pb-7"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={baseTransition}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">
                  {DAY_LABELS[editing.day]}曜 {editing.period + 1}限
                </p>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="閉じる"
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-charcoal-muted transition hover:bg-cream"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {TIMETABLE_SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => choose(s)}
                    aria-pressed={current === s}
                    className={
                      "h-11 rounded-xl border px-1 text-sm font-medium transition-colors " +
                      (current === s
                        ? "border-sage-600 bg-sage-600 text-white"
                        : "border-border-soft bg-white text-charcoal hover:border-sage-600")
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => choose(null)}
                className="mt-3 w-full rounded-full border border-border-soft py-3 text-sm font-bold text-charcoal-muted transition hover:bg-cream"
              >
                空きにする
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Row({
  period,
  timetable,
  today,
  onEdit,
}: {
  period: number
  timetable: Timetable
  today: number
  onEdit: (day: number) => void
}) {
  return (
    <>
      <span className="flex items-center justify-center text-xs font-bold text-charcoal-muted">{period + 1}</span>
      {SCHOOL_DAYS.map((d) => {
        const subject = timetable[d]?.[period] ?? null
        return (
          <button
            key={d}
            type="button"
            onClick={() => onEdit(d)}
            aria-label={`${DAY_LABELS[d]}曜 ${period + 1}限：${subject ?? "空き"}`}
            className={
              "flex h-12 items-center justify-center rounded-xl border text-[13px] font-bold transition lg:h-14 lg:text-sm " +
              (subject
                ? "border-sage-600/20 bg-sage-50 text-sage-700"
                : "border-dashed border-border-soft text-border-soft hover:border-sage-600") +
              (d === today ? " ring-1 ring-sage-600/40" : "")
            }
          >
            {subject ? (
              <>
                <span className="lg:hidden">{shortSubject(subject)}</span>
                <span className="hidden lg:inline">{subject}</span>
              </>
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        )
      })}
    </>
  )
}
