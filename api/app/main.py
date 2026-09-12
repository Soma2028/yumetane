"""夢のタネ API。

職業カードを1枚ずつ提示し、スワイプ（気になる/ちがう）の反応から
ユーザーの興味の位置を推定して、次のカードと推薦結果を返す。

10問クイズ形式（旧 GET /questions, POST /answers）は設計・検証の上で、
体験として目的に合わないと判断し廃止した。経緯はdocs/design.md参照。
推薦ロジックの実体は scoring.py / explain.py。
"""

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .data import load_jobs
from .explain import explain
from .schemas import HistoryRequest, JobOut, NextCardResponse, RecommendResponse
from .scoring import next_card, result_from_history

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


@app.get("/health")
def get_health() -> dict:
    """Renderの無料枠がスリープしていても起こせるよう、フロントの
    ウォームアップ用リクエスト先として使う（web/src/api.tsのwarmupApi）。"""
    return {"status": "ok"}


@app.post("/cards/next", response_model=NextCardResponse)
def post_next_card(body: HistoryRequest) -> NextCardResponse:
    """次に見せるカードを1枚返す。

    候補が尽きた場合、またはMAX_CARDS枚（scoring.MAX_CARDS）に達した場合は
    done=Trueとcard=Noneを返す。クライアントは結果画面に誘導する。
    """
    history = [h.model_dump() for h in body.history]
    card = next_card(history)
    if card is None:
        return NextCardResponse(card=None, done=True)
    return NextCardResponse(card=JobOut(**card), done=False)


@app.post("/result", response_model=RecommendResponse)
def post_result(body: HistoryRequest) -> RecommendResponse:
    """スワイプ履歴から推薦職業と理由を返す。中間結果・最終結果で共用する。"""
    history = [h.model_dump() for h in body.history]
    riasec_z, jobs = result_from_history(history)
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
