export interface Job {
  job_id: number
  job_name: string
  description: string
  riasec_source: "observed" | "predicted"
  awareness_label: string
  tags: string[]
  area: string
}

export interface DiscoverResponse {
  job: Job | null
  exhausted: boolean
}
