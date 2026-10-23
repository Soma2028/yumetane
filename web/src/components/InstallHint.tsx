import { ChevronDown, Share, X } from "lucide-react"
import { useState } from "react"

const DISMISS_KEY = "yumetane_install_hint_dismissed"

/** iPhone・iPadのブラウザで開いていて、まだホーム画面から開いていないときだけtrue。 */
function shouldShowInstallHint(): boolean {
  if (typeof window === "undefined") return false
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  if (!isIOS || isStandalone) return false
  try {
    return sessionStorage.getItem(DISMISS_KEY) !== "1"
  } catch {
    return true
  }
}

/**
 * iOSのSafariは、7日間操作の無いサイトのlocalStorageを消す（https://webkit.org/tracking-prevention/）。
 * ホーム画面に追加したWebアプリは対象外なので、追加を案内する。記録が消えるかどうかに関わるため、
 * 閉じてもこのタブを開いている間だけ隠し、次に開いたときはまた出す。
 * ホーム画面のアプリとSafariのデータは別々に保存され、引き継がれないことも正直に書く。
 */
export function InstallHint() {
  const [visible, setVisible] = useState(shouldShowInstallHint)
  const [open, setOpen] = useState(false)
  if (!visible) return null

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // 保存できなくても、今回は閉じる
    }
    setVisible(false)
  }

  // ホーム画面を1画面に収めるため、ふだんは1行にたたみ、押したときだけ手順を開く
  return (
    <div className="relative rounded-2xl border border-sage-600/30 bg-sage-50 text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 py-2.5 pr-11 pl-4 text-left font-bold text-sage-700"
      >
        <Share className="h-4 w-4 shrink-0" />
        <span className="flex-1">ホーム画面に追加すると、記録が消えないよ</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="案内を閉じる"
        className="absolute top-0.5 right-1 flex h-10 w-10 items-center justify-center rounded-full text-charcoal-muted transition hover:bg-white"
      >
        <X className="h-4 w-4" />
      </button>
      {open && (
        <div className="border-t border-sage-600/20 px-4 pt-2 pb-3">
          <p className="leading-relaxed text-charcoal">
            このまま7日間ひらかないと、記録が消えてしまうことがあるよ。ホーム画面から開けば消えないし、アプリみたいに使えるよ。
          </p>
          <ol className="mt-2 flex flex-col gap-1 text-charcoal">
            <li className="flex items-center gap-1.5">
              <span className="font-bold">1.</span>
              <Share className="h-4 w-4 text-sage-700" />
              <span>共有ボタンをタップ</span>
            </li>
            <li>
              <span className="font-bold">2.</span> 「ホーム画面に追加」を選ぶ
            </li>
          </ol>
          <p className="mt-2 text-xs leading-relaxed text-charcoal-muted">
            ※ここまでの記録は、ホーム画面のアプリには引き継がれないよ
          </p>
        </div>
      )}
    </div>
  )
}
