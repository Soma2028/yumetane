export type TaneStage = 0 | 1 | 2 | 3 | 4

/** ステージ開始件数（index = stage）。 */
export const STAGE_MIN: readonly [number, number, number, number, number] = [0, 10, 30, 60, 100]

/** 推薦対象の全職業数。タネが最終ステージで出会える上限。 */
export const MAX_JOB_COUNT = 167

export function stageFromCount(count: number): TaneStage {
  for (let stage = STAGE_MIN.length - 1; stage >= 0; stage--) {
    if (count >= STAGE_MIN[stage]) return stage as TaneStage
  }
  return 0
}

export interface StageProgress {
  stage: TaneStage
  /** 現在のステージに入るのに必要だった件数。 */
  currentMin: number
  /** 次のステージに必要な件数。最終ステージ（4）のときはnull。 */
  nextThreshold: number | null
}

export function stageProgress(count: number): StageProgress {
  const stage = stageFromCount(count)
  const nextThreshold = stage < 4 ? STAGE_MIN[stage + 1] : null
  return { stage, currentMin: STAGE_MIN[stage], nextThreshold }
}
