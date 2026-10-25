import { AnimatePresence, motion } from "framer-motion"
import { Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { baseTransition } from "../motion"
import { DAY_LABELS, PERIODS, TIMETABLE_SUBJECTS, activeDays, shortSubject, type Timetable } from "../timetable"
import { BackButton } from "./BackButton"
import { subjectColor } from "../subjectColors"
import { SubjectDot } from "./SubjectDot"

interface Props {
  timetable: Timetable
  showSaturday: boolean
  onToggleSaturday: (show: boolean) => void
  onChange: (day: number, period: number, subject: string | null) => void
  onBack: () => void
}

/** 月〜土 × 1〜6限の時間割。マスを押すと、下から出るパネルで教科を選ぶ。 */
export function TimetableScreen({ timetable, showSaturday, onToggleSaturday, onChange, onBack }: Props) {
  const days = activeDays(showSaturday)
  // 列の数が土曜日のオン・オフで変わるため、grid-template-columnsは直接指定する
  const columns = { gridTemplateColumns: `var(--period-col) repeat(${days.length}, minmax(0, 1fr))` }
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
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10 lg:max-w-3xl lg:px-10 [@media(max-height:740px)]:gap-3 [@media(max-height:740px)]:py-4">
      <BackButton onClick={onBack} />

      <div>
        <h2 className="ui-page-title">時間割</h2>
        <p className="mt-1 text-sm text-charcoal-muted">マスを押して教科を入れてね。今日の分がホームに出るよ。</p>
      </div>

      {/* 土曜日に授業がない学校向けに、土曜日の列を隠せるようにする（中身は消さない） */}
      <label className="ui-card flex cursor-pointer items-center justify-between px-4 py-3 [@media(max-height:740px)]:py-2">
        <span>
          <span className="block text-sm font-bold">土曜日も使う</span>
          <span className="text-xs text-charcoal-muted">オフにしても、入れた土曜日の時間割は消えないよ</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={showSaturday}
          onChange={(e) => onToggleSaturday(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="relative h-7 w-12 shrink-0 rounded-full bg-border-soft transition-colors peer-checked:bg-sage-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sage-600/40 after:absolute after:top-0.5 after:left-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
        />
      </label>

      <div className="ui-card p-3 lg:p-5">
        <div className="grid gap-1.5 [--period-col:1.5rem] lg:gap-2 lg:[--period-col:2rem]" style={columns}>
          <span />
          {days.map((d) => (
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
            <Row key={period} period={period} days={days} timetable={timetable} today={today} onEdit={(day) => setEditing({ day, period })} />
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
                    <span className="flex items-center justify-center gap-1.5">
                      <SubjectDot subject={s} />
                      {s}
                    </span>
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
  days,
  timetable,
  today,
  onEdit,
}: {
  period: number
  days: number[]
  timetable: Timetable
  today: number
  onEdit: (day: number) => void
}) {
  return (
    <>
      <span className="flex items-center justify-center text-xs font-bold text-charcoal-muted">{period + 1}</span>
      {days.map((d) => {
        const subject = timetable[d]?.[period] ?? null
        return (
          <button
            key={d}
            type="button"
            onClick={() => onEdit(d)}
            aria-label={`${DAY_LABELS[d]}曜 ${period + 1}限：${subject ?? "空き"}`}
            className={
              "flex h-12 items-center justify-center rounded-xl border text-[13px] font-bold transition lg:h-14 lg:text-sm [@media(max-height:740px)]:h-10 " +
              (subject ? "border-transparent" : "border-dashed border-border-soft text-border-soft hover:border-sage-600") +
              (d === today ? " ring-1 ring-sage-600/40" : "")
            }
            style={subject ? { backgroundColor: subjectColor(subject).bg, color: subjectColor(subject).text } : undefined}
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
