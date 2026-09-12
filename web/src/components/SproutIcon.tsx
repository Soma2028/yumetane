interface Props {
  className?: string
}

/** 「夢のタネ」のロゴ的モチーフ。装飾用の小さな芽のアイコン。 */
export function SproutIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 40V22"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M24 24c0-7 6-11 13-11 0 8-5 13-13 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 28c0-6-5-9-11-9 0 7 4 11 11 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
