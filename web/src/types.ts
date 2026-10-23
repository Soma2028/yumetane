export interface Subject {
  name: string
  is_special: boolean // trueの場合、職業発見（POST /discover）の対象外（例: 保健体育）
}

export interface Job {
  job_id: number
  job_name: string
  description: string
  riasec_source: "observed" | "predicted"
  awareness_label: string
  tags: string[]
  area: string
  jobtag_url: string // job tag（厚労省）の職業詳細ページ。写真・動画・なり方などが載っている
}

export interface DiscoverResponse {
  job: Job | null
  exhausted: boolean
}
