"""APIのリクエスト/レスポンスの型。"""

from pydantic import BaseModel


class QuestionOut(BaseModel):
    id: str
    choice_1: str
    choice_2: str


class QuestionsResponse(BaseModel):
    seed: str
    questions: list[QuestionOut]


class AnswersRequest(BaseModel):
    seed: str
    answers: dict[str, str]


class JobOut(BaseModel):
    job_id: int
    job_name: str
    description: str
    riasec_source: str
    awareness_label: str
    similarity: float | None = None


class RecommendResponse(BaseModel):
    riasec: dict[str, float]
    explanation: str
    jobs: list[JobOut]
