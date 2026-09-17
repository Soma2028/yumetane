interface Props {
  lines: string[]
  className?: string
}

/** タネの隣に置く、角丸の白い吹き出し。複数行のセリフを縦に並べて表示する。 */
export function TaneSpeech({ lines, className }: Props) {
  if (lines.length === 0) return null

  return (
    <div
      className={`relative rounded-2xl border border-border-soft bg-white px-4 py-3 ${className ?? ""}`}
    >
      <span
        aria-hidden
        className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 border-b border-l border-border-soft bg-white"
      />
      <div className="flex flex-col gap-0.5">
        {lines.map((line, i) => (
          <p key={i} className="text-lg font-medium leading-relaxed text-charcoal">
            {i === 0 ? `🌱 ${line}` : line}
          </p>
        ))}
      </div>
    </div>
  )
}
