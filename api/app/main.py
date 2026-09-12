"""夢のタネ API。

10問の質問を出し、回答を採点してRIASEC空間に配置し、類似度の高い職業を推薦する。
推薦ロジックの実体は scoring.py / explain.py（notebooks/07・08で検証済み）。
"""

import os
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .data import load_jobs
from .explain import explain
from .schemas import AnswersRequest, JobOut, QuestionOut, QuestionsResponse, RecommendResponse
from .scoring import recommend, render_questions

app = FastAPI(title="夢のタネ API")

# ローカル開発用のオリジンは常に許可し、本番のフロントのオリジン（Vercel等）は
# ALLOWED_ORIGINS環境変数（カンマ区切り）で追加する。例:
# ALLOWED_ORIGINS=https://yumetane.vercel.app,https://yumetane-git-main.vercel.app
_default_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
_extra_origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins + _extra_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/questions", response_model=QuestionsResponse)
def get_questions(seed: str | None = None) -> QuestionsResponse:
    """10問を表示順ランダム化した状態で返す。

    seedを省略すると新しく発行する。同じseedを渡せば同じ並びが再現される
    （クライアントは発行されたseedを保持し、POST /answers に渡す）。
    """
    seed = seed or uuid.uuid4().hex
    questions = render_questions(seed)
    return QuestionsResponse(seed=seed, questions=[QuestionOut(**q) for q in questions])


RECOMMEND_POOL_SIZE = 20
"""上位5件だけでなく多めに返す。結果画面で「知ってる」と答えた職業を除いた後、
追加の通信をせずに次点の職業を出せるようにするため（docs/design.mdの
「静的スコアは初期の並べ替えのみ、実際の出し分けは対話で決める」設計）。"""


@app.post("/answers", response_model=RecommendResponse)
def post_answers(body: AnswersRequest) -> RecommendResponse:
    """10問の回答を受け取り、推薦職業と理由を返す。

    jobsは類似度上位から最大 RECOMMEND_POOL_SIZE 件を返す。クライアント側は
    先頭5件を表示し、「知ってる」と答えたものを除いて後続の職業で埋める。
    """
    try:
        riasec_z, jobs = recommend(body.answers, n=RECOMMEND_POOL_SIZE)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    return RecommendResponse(
        riasec=riasec_z,
        explanation=explain(riasec_z),
        jobs=[
            JobOut(
                job_id=int(row.job_id),
                job_name=row.job_name,
                description=row.description,
                riasec_source=row.riasec_source,
                awareness_label=row.awareness_label,
                similarity=float(row.similarity),
            )
            for row in jobs.itertuples()
        ],
    )


@app.get("/jobs/{job_id}", response_model=JobOut)
def get_job(job_id: int) -> JobOut:
    """職業1件の詳細。職業図鑑・推薦結果からのリンク先で使う想定。

    現時点ではjobs.csv（推薦対象167件）のみが対象。RIASECのunavailable7件など、
    推薦対象外の職業カタログはまだ処理していない（docs/design.md参照）。
    """
    jobs = load_jobs()
    match = jobs[jobs["job_id"] == job_id]
    if match.empty:
        raise HTTPException(status_code=404, detail="職業が見つかりません")
    row = match.iloc[0]
    return JobOut(
        job_id=int(row.job_id),
        job_name=row.job_name,
        description=row.description,
        riasec_source=row.riasec_source,
        awareness_label=row.awareness_label,
    )
