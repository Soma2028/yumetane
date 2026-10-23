import type { TargetAndTransition, Transition, Variants } from "framer-motion"

/**
 * アプリ全体で共通のアニメーションの決まり。画面ごとに長さ・距離・緩み方がばらばらだったため
 * （0.3〜0.5秒、8〜40px、イージング未指定など）、ここにまとめて全画面で使う。
 */

/** 長さ（秒）。tap: 押したときの反応、base: 現れる・消える・パネルの開閉 */
export const DURATION = { tap: 0.15, base: 0.3 } as const

/** 動き出しは速く、止まり際をゆっくりにする緩み方（ease-out系）。 */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** 下から現れるときの距離（px）。 */
export const ENTER_DISTANCE = 16

/** 続けて現れる要素どうしの間隔（秒）。 */
export const STAGGER = 0.08

export const baseTransition: Transition = { duration: DURATION.base, ease: EASE_OUT }

/** 下から現れる（variantsで使う版）。 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: ENTER_DISTANCE },
  show: { opacity: 1, y: 0, transition: baseTransition },
}

/** 子要素をSTAGGERずつずらして現す親のvariants。 */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER } },
}

/** 下から現れる（initial/animate/transitionを直接渡す版）。delayで順番をつける。 */
export function enter(delay = 0) {
  return {
    initial: { opacity: 0, y: ENTER_DISTANCE },
    animate: { opacity: 1, y: 0 },
    transition: { ...baseTransition, delay },
  }
}

/**
 * 一覧のカード用：画面に入ったら下から現れる。index番目ほど少し遅らせる（5枚目以降は同じ）。
 * 要素側のtransitionにdelayを書いても、variantsの側にtransitionがあると無視されるため、
 * variantsを使わずに値を直接渡す。きろく・タネ・職業図鑑で共通。
 */
export function cardInView(index: number) {
  return {
    initial: { opacity: 0, y: ENTER_DISTANCE },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { ...baseTransition, delay: Math.min(index, 4) * STAGGER },
  }
}

/** タネのキャラクターがふわふわ浮く動き（アプリ内とLPで共通）。 */
export const float: { animate: TargetAndTransition; transition: Transition } = {
  animate: { y: [0, -6, 0], rotate: [-1, 1, -1] },
  transition: {
    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
}
