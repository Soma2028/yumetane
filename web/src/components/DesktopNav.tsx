import { BarChart3, BookOpen, CalendarDays, Flame, Home, Star, type LucideIcon } from "lucide-react"
import { SproutIcon } from "./SproutIcon"
import { TaneCharacter } from "./TaneCharacter"

export type NavKey = "home" | "zukan" | "tane" | "kiroku" | "timetable"

const ITEMS: { key: NavKey; label: string; icon: LucideIcon }[] = [
  { key: "home", label: "ホーム", icon: Home },
  { key: "zukan", label: "職業図鑑", icon: BookOpen },
  { key: "tane", label: "タネ", icon: Star },
  { key: "kiroku", label: "きろく", icon: BarChart3 },
  { key: "timetable", label: "時間割", icon: CalendarDays },
]

interface Props {
  /** 今いる画面にあたるメニュー。職業の詳細など、どれにも当たらない画面ではnull。 */
  current: NavKey | null
  onNavigate: (key: NavKey) => void
  onRecord: () => void
  onOpenGrowth: () => void
  zukanCount: number
  streak: number
}

/**
 * パソコン（lg以上）だけに出す左のメニュー。スマホ版は画面の移動が「もどる」ボタンと
 * ホーム下の導線だけだったため、パソコンではどの画面からでも一度で移れるようにする。
 * いちばん下に、記録する（いちばん使う操作）と、タネの部屋への入口を置く。
 */
export function DesktopNav({ current, onNavigate, onRecord, onOpenGrowth, zukanCount, streak }: Props) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-border-soft bg-white/70 px-4 py-6 backdrop-blur lg:flex">
      <p className="flex items-center gap-2 px-3 text-lg font-bold text-sage-700">
        <SproutIcon className="h-6 w-6" />
        夢のタネ
      </p>

      <nav aria-label="メニュー" className="mt-8 flex flex-col gap-1">
        {ITEMS.map(({ key, label, icon: Icon }) => {
          const active = current === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              aria-current={active ? "page" : undefined}
              className={
                "flex h-11 items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold transition " +
                (active ? "bg-sage-50 text-sage-700" : "text-charcoal-muted hover:bg-cream hover:text-charcoal")
              }
            >
              <Icon className={"h-5 w-5 " + (active ? "text-sage-600" : "")} strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={onOpenGrowth}
          className="ui-card flex items-center gap-3 px-3 py-2.5 text-left transition hover:border-sage-600"
          aria-label="タネの部屋を見る"
        >
          <TaneCharacter count={zukanCount} size={44} />
          <span className="min-w-0">
            <span className="block text-sm font-bold">タネの部屋</span>
            <span className="flex items-center gap-1 text-xs text-charcoal-muted">
              {streak > 0 ? (
                <>
                  <Flame className="h-3.5 w-3.5" />
                  {streak}日連続
                </>
              ) : (
                `図鑑 ${zukanCount}件`
              )}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onRecord}
          className="rounded-full bg-coral-500 py-3 text-center text-sm font-bold text-white shadow-sm transition active:bg-coral-600"
        >
          今日の勉強を記録する
        </button>
      </div>
    </aside>
  )
}
