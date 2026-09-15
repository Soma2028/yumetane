"""APIのリクエスト/レスポンスの型。"""

from pydantic import BaseModel


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
