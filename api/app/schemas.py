"""APIのリクエスト/レスポンスの型。"""

from typing import Literal

from pydantic import BaseModel


class SwipeEntry(BaseModel):
    job_id: int
    direction: Literal["left", "right"]


class HistoryRequest(BaseModel):
    history: list[SwipeEntry]


class JobOut(BaseModel):
    job_id: int
    job_name: str
    description: str
    riasec_source: str
    awareness_label: str
    similarity: float | None = None


class NextCardResponse(BaseModel):
    card: JobOut | None
    done: bool


class RecommendResponse(BaseModel):
    riasec: dict[str, float]
    explanation: str
    jobs: list[JobOut]
