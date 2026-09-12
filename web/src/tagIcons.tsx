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

export function iconForTags(tags: string[]): LucideIcon {
  const first = tags[0]
  return (first && TAG_ICONS[first]) || DEFAULT_ICON
}
