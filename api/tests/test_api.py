import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

SESSION1_ANSWERS = {
    "Q1": "テストのように答えが一つに決まっている問題の方が面白い",
    "Q2": "教わったとおりにやる方が好き",
    "Q3": "レシピどおりに正確に作る方が好き",
    "Q4": "こわれたものを自分で直してみたい",
    "Q5": "新しい道具や機械のしくみを調べる方が得意な気がする",
    "Q6": "作り方の動画を見て何かを作る方が楽しそう",
    "Q7": "最初に完成までの手順を決めてから進める方が自分に近い",
    "Q8": "ゲームはルールどおりに進める方が好き",
    "Q9": "しくみや理由を突き止める授業の方が好き",
    "Q10": "作品を作って見せる方にする",
}


def test_get_questions_without_seed_issues_one():
    r = client.get("/questions")
    assert r.status_code == 200
    body = r.json()
    assert body["seed"]
    assert len(body["questions"]) == 10


def test_get_questions_same_seed_reproducible():
    r1 = client.get("/questions", params={"seed": "abc"})
    r2 = client.get("/questions", params={"seed": "abc"})
    assert r1.json()["questions"] == r2.json()["questions"]


def test_post_answers_returns_job_pool_and_explanation():
    r = client.post("/answers", json={"seed": "abc", "answers": SESSION1_ANSWERS})
    assert r.status_code == 200
    body = r.json()
    # 結果画面で「知ってる」除外後に埋め合わせできるよう、上位5件より多く返す
    assert len(body["jobs"]) > 5
    assert body["jobs"][0]["job_name"] == "計器組立"
    assert body["explanation"]
    assert body["riasec"]["現実的"] == pytest.approx(1.89, abs=0.02)


def test_post_answers_missing_question_returns_422():
    incomplete = dict(SESSION1_ANSWERS)
    del incomplete["Q1"]
    r = client.post("/answers", json={"seed": "abc", "answers": incomplete})
    assert r.status_code == 422


def test_post_answers_unknown_choice_text_returns_422():
    bad = dict(SESSION1_ANSWERS)
    bad["Q1"] = "存在しない選択肢"
    r = client.post("/answers", json={"seed": "abc", "answers": bad})
    assert r.status_code == 422


def test_get_job_detail():
    r = client.get("/jobs/2")
    assert r.status_code == 200
    assert r.json()["job_name"] == "洋菓子製造、パティシエ"


def test_get_job_not_found():
    r = client.get("/jobs/999999")
    assert r.status_code == 404
