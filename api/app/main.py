"""夢のタネ API。

今日勉強した教科を受け取り、その教科の知識をよく使う職業を1件見つけて返す。
すべての状態（学習記録・職業図鑑・タネ）はクライアント側（localStorage）に持ち、
このAPIはステートレス。既出職業の除外リストも毎回クライアントから送る。

10問クイズ形式・スワイプ形式（旧 GET /questions, POST /answers,
POST /cards/next, POST /result）は設計・検証の上で廃止した。経緯はdocs/design.md参照。
選定ロジックの実体は discovery.py / tags.py。
"""

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .areas import area_counts, dominant_area
from .data import load_jobs
from .discovery import STUDIABLE_SUBJECTS, discover_job
from .schemas import DiscoverRequest, DiscoverResponse, JobOut
from .tags import select_tags

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


@app.get("/subjects")
def get_subjects() -> list[str]:
    """学習記録で選べる教科の一覧。保健体育は対応する知識項目が無いため含まない
    （docs/design.md「知識33項目 → 教科への対応」参照）。"""
    return STUDIABLE_SUBJECTS


@app.get("/areas")
def get_areas() -> dict[str, int]:
    """職業図鑑の6エリア（RIASEC因子）ごとの、全167職業中の件数。
    図鑑画面の踏破率の分母として使う（分子はクライアントが自分の図鑑から数える）。"""
    return area_counts(load_jobs())


@app.post("/discover", response_model=DiscoverResponse)
def post_discover(body: DiscoverRequest) -> DiscoverResponse:
    """今日勉強した教科から、職業を1件見つける。

    その教科の候補プールを図鑑登録済みの職業ですべて使い切っている場合は、
    job=None・exhausted=Trueを返す。
    """
    try:
        job = discover_job(body.subject, body.known_job_ids)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    if job is None:
        return DiscoverResponse(job=None, exhausted=True)
    return DiscoverResponse(job=JobOut(**job), exhausted=False)


@app.get("/jobs/{job_id}", response_model=JobOut)
def get_job(job_id: int) -> JobOut:
    """職業1件の詳細。職業図鑑・タネの詳細画面で使う。

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
        tags=select_tags(row),
        area=dominant_area(row),
    )
