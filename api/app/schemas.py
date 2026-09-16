"""APIのリクエスト/レスポンスの型。"""

from pydantic import BaseModel


class SubjectOut(BaseModel):
    name: str
    is_special: bool = False  # Trueの場合、POST /discoverの対象外（例: 保健体育）


class JobOut(BaseModel):
    job_id: int
    job_name: str
    description: str
    riasec_source: str
    awareness_label: str
    tags: list[str] = []
    area: str


class DiscoverRequest(BaseModel):
    subject: str
    known_job_ids: list[int] = []


class DiscoverResponse(BaseModel):
    job: JobOut | None
    exhausted: bool
