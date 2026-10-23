/**
 * デプロイのたびに、後から読み込むJS（きろく画面など）のファイル名が変わり、古い名前の
 * ファイルは本番から消える。デプロイ前から開いていたページ（ホーム画面のアプリは特に
 * 開きっぱなしになりやすい）がそれを読み込もうとすると失敗するため、1回だけページを
 * 読み込み直して新しい版に切り替え、開こうとしていた画面に戻す。
 */

const RELOADED_AT_KEY = "yumetane_stale_chunk_reloaded_at"
const RESUME_SCREEN_KEY = "yumetane_resume_screen"
/** この時間内に2回目の失敗が起きたら、読み込み直しても直らない（通信が無い等）とみなす。 */
const RELOAD_GUARD_MS = 30_000

/** 読み込み直しを始めたらtrue。直近に読み込み直したばかりならfalse（呼び出し側でエラー表示）。 */
export function reloadForStaleChunk(resumeScreen: string): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOADED_AT_KEY) ?? 0)
    if (Date.now() - last < RELOAD_GUARD_MS) return false
    sessionStorage.setItem(RELOADED_AT_KEY, String(Date.now()))
    sessionStorage.setItem(RESUME_SCREEN_KEY, resumeScreen)
  } catch {
    // sessionStorageが使えないと繰り返しを止められないため、読み込み直さない
    return false
  }
  window.location.reload()
  return true
}

/** 読み込み直す前に開こうとしていた画面。一度読んだら消す。 */
export function takeResumeScreen(): string | null {
  try {
    const screen = sessionStorage.getItem(RESUME_SCREEN_KEY)
    sessionStorage.removeItem(RESUME_SCREEN_KEY)
    return screen
  } catch {
    return null
  }
}
