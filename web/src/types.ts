export interface Question {
  id: string
  choice_1: string
  choice_2: string
}

export interface QuestionsResponse {
  seed: string
  questions: Question[]
}

export interface Job {
  job_id: number
  job_name: string
  description: string
  riasec_source: "observed" | "predicted"
  awareness_label: string
  similarity?: number
}

export interface RecommendResponse {
  riasec: Record<string, number>
  explanation: string
  jobs: Job[]
}
