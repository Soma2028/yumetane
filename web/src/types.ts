export interface Job {
  job_id: number
  job_name: string
  description: string
  riasec_source: "observed" | "predicted"
  awareness_label: string
  tags: string[]
  similarity?: number
}

export type SwipeDirection = "left" | "right"

export interface SwipeEntry {
  job_id: number
  direction: SwipeDirection
}

export interface NextCardResponse {
  card: Job | null
  done: boolean
}

export interface RecommendResponse {
  riasec: Record<string, number>
  explanation: string
  jobs: Job[]
}
