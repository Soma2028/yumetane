import { subjectColor } from "../subjectColors"

/** 教科名の前に添える、その教科の色の丸い印。 */
export function SubjectDot({ subject, className = "h-2.5 w-2.5" }: { subject: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: subjectColor(subject).solid }}
    />
  )
}
