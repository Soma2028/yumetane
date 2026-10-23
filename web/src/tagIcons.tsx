import { createElement } from "react"
import {
  Armchair,
  Calendar,
  ClipboardCheck,
  Cog,
  Compass,
  Footprints,
  HandHelping,
  HardHat,
  MessageCircle,
  Mic2,
  Microscope,
  Palette,
  PersonStanding,
  Repeat,
  Ruler,
  Shield,
  Shuffle,
  Target,
  Trees,
  TrendingUp,
  Users,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react"

// カードの画像プレースホルダー用。実画像が用意でき次第、差し替える。
// タグ（docs/vocab.md「職業タグ」）ごとに対応するアイコンを1つ割り当てる。
const TAG_ICONS: Record<string, LucideIcon> = {
  外で働く: Trees,
  座って集中: Armchair,
  立ち仕事: PersonStanding,
  歩き回る仕事: Footprints,
  人と関わる: Users,
  チームで動く: UsersRound,
  お客さんと話す: MessageCircle,
  みんなをまとめる: Mic2,
  スピード勝負: TrendingUp,
  決まった予定で動く: Calendar,
  毎日ちがう: Shuffle,
  結果に責任を持つ: Target,
  人の安全を守る: Shield,
  正確さが大事: Ruler,
  コツコツ続ける: Repeat,
  自分で決められる: Compass,
  特別な装備を使う: HardHat,
  手先を使う: HandHelping,
  機械と働く: Cog,
  ものづくり: Wrench,
  しくみを調べる: Microscope,
  表現する: Palette,
  人を助ける: HandHelping,
  リーダーになる: TrendingUp,
  きちんと進める: ClipboardCheck,
}

const DEFAULT_ICON: LucideIcon = Wrench

// アイコンは職業の「中身」が伝わるタグから選ぶ。先頭のタグ（スコアの最も高いもの）は
// 「座って集中」「毎日ちがう」のような働き方のタグであることが多く、そのままだと弁理士に
// 椅子のアイコンが付くなど、仕事の内容とちぐはぐになっていた。上にあるタグほど優先する
const ICON_PRIORITY = [
  "特別な装備を使う",
  "機械と働く",
  "手先を使う",
  "ものづくり",
  "しくみを調べる",
  "表現する",
  "人の安全を守る",
  "人を助ける",
  "お客さんと話す",
  "外で働く",
  "みんなをまとめる",
  "リーダーになる",
  "正確さが大事",
  "きちんと進める",
]

function iconForTags(tags: string[]): LucideIcon {
  const preferred = ICON_PRIORITY.find((tag) => tags.includes(tag))
  const tag = preferred ?? tags[0]
  return (tag && TAG_ICONS[tag]) || DEFAULT_ICON
}

/**
 * タグに対応するアイコンを描く。描画中にiconForTagsの戻り値を<Icon />として
 * 使うと、レンダーごとに別コンポーネント扱いになりうる（lint: static-components）
 * ため、こちらを使う。
 */
export function TagIcon({ tags, className, strokeWidth }: { tags: string[]; className?: string; strokeWidth?: number }) {
  return createElement(iconForTags(tags), { className, strokeWidth })
}
