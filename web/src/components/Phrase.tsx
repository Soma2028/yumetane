import type { ReactNode } from "react"

/**
 * 意味のまとまり（文節）を途中で折り返さないための囲み。日本語はどの文字の間でも
 * 改行されるため、狭い画面で「ありませ／ん。」「見つけ／た」のように言葉が割れる。
 * まとまりごとにこれで囲むと、改行はまとまりの間でだけ起きる。
 */
export function Phrase({ children }: { children: ReactNode }) {
  return <span className="inline-block">{children}</span>
}
