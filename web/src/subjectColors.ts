/**
 * 教科ごとの色。時間割・記録パネル・きろく・図鑑など、教科が出る場所はすべてここの色を使う
 * （以前はきろくの円グラフだけが勉強時間の多い順に色を付けていて、週によって色が変わった）。
 *
 * solid: 円グラフ・丸い印。bg: マスやボタンの背景。text: bgの上の文字（bgとのコントラストを
 * 4.5以上にしてある）。白い文字はsolidの上でも読みにくい色があるため使わない。
 */
export interface SubjectColor {
  solid: string
  bg: string
  text: string
}

const COLORS: Record<string, SubjectColor> = {
  数学: { solid: "#3B6FB6", bg: "#E6EEF8", text: "#24497A" },
  国語: { solid: "#C2473F", bg: "#F8E5E3", text: "#8A2B25" },
  理科: { solid: "#2E8B57", bg: "#E2F2E8", text: "#1D5E3A" },
  社会: { solid: "#9C6B3E", bg: "#F3EADF", text: "#6B4524" },
  英語: { solid: "#7B5AB0", bg: "#EEE8F6", text: "#523A7A" },
  美術: { solid: "#C2528A", bg: "#F7E4EE", text: "#87305C" },
  音楽: { solid: "#2A8C96", bg: "#E0F1F2", text: "#1A5E65" },
  "技術・家庭": { solid: "#7A8A2E", bg: "#EEF1DE", text: "#4F5A1A" },
  保健体育: { solid: "#D9703A", bg: "#FBE9DF", text: "#8F421B" },
  道徳: { solid: "#6B7A8F", bg: "#ECEFF3", text: "#434D5B" },
  総合: { solid: "#8A6E5A", bg: "#F1EBE6", text: "#5A4536" },
  学活: { solid: "#9C7C12", bg: "#F8F1D8", text: "#6E570E" },
}

// 美術と音楽が分かれる前に記録されたログの教科名
COLORS["美術・音楽"] = COLORS["美術"]

const FALLBACK: SubjectColor = { solid: "#6b6358", bg: "#EFEBE4", text: "#4A443B" }

export function subjectColor(subject: string): SubjectColor {
  return COLORS[subject] ?? FALLBACK
}
