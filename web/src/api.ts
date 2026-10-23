import type { DiscoverResponse, Job, Subject } from "./types"

// 以前はRenderにデプロイしたAPIを呼んでいたが、無料枠のスリープで初回アクセスに
// 50秒ほどかかっていた。APIはステートレスでjobs.csvしか読まないため、
// 候補プール・重み・タグ・エリアをscripts/export_web_data.pyで事前計算した
// data/jobs.jsonを読み、抽選（重み付きサンプリング）だけをここで行う。
// 選定ロジックの正本はapi/app/（discovery.py / tags.py / areas.py）。

interface PoolEntry {
  job_id: number
  weight: number
}

interface WebData {
  subjects: Subject[]
  areas: Record<string, number>
  pools: Record<string, PoolEntry[]>
  jobs: Job[]
}

// LPの表示を軽くするため、JSONは最初に必要になった時点で別チャンクとして読む。
let dataPromise: Promise<{ data: WebData; jobsById: Map<number, Job> }> | null = null

function loadData() {
  dataPromise ??= import("./data/jobs.json").then((mod) => {
    const data = mod.default as WebData
    return { data, jobsById: new Map(data.jobs.map((j) => [j.job_id, j])) }
  })
  return dataPromise
}

export async function fetchSubjects(): Promise<Subject[]> {
  const { data } = await loadData()
  return data.subjects
}

export async function fetchAreas(): Promise<Record<string, number>> {
  const { data } = await loadData()
  return data.areas
}

/**
 * 今日勉強した教科の候補プールから、まだ図鑑に無い職業を認知度の重みで1件選ぶ
 * （api/app/discovery.pyのdiscover_jobと同じ）。プールを使い切っていれば
 * job=null・exhausted=trueを返す。
 */
export async function discover(subject: string, knownJobIds: number[]): Promise<DiscoverResponse> {
  const { data, jobsById } = await loadData()
  const pool = data.pools[subject]
  if (!pool) throw new Error("職業を見つけられませんでした")

  const known = new Set(knownJobIds)
  const candidates = pool.filter((p) => !known.has(p.job_id))
  if (candidates.length === 0) return { job: null, exhausted: true }

  const total = candidates.reduce((sum, p) => sum + p.weight, 0)
  let r = Math.random() * total
  let picked = candidates[candidates.length - 1]
  for (const p of candidates) {
    r -= p.weight
    if (r < 0) {
      picked = p
      break
    }
  }
  return { job: jobsById.get(picked.job_id)!, exhausted: false }
}

export async function fetchJob(jobId: number): Promise<Job> {
  const { jobsById } = await loadData()
  const job = jobsById.get(jobId)
  if (!job) throw new Error("職業情報の取得に失敗しました")
  return job
}
