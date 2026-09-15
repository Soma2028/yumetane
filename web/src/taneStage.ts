export type TaneStage = 0 | 1 | 2 | 3 | 4

const STAGE_THRESHOLDS: [minCount: number, stage: TaneStage][] = [
  [100, 4],
  [60, 3],
  [30, 2],
  [10, 1],
  [0, 0],
]

export function stageFromCount(count: number): TaneStage {
  for (const [min, stage] of STAGE_THRESHOLDS) {
    if (count >= min) return stage
  }
  return 0
}
