import pytest

from app.explain import explain
from app.scoring import (
    display_order,
    recommend,
    render_questions,
    riasec_z_from_answers,
    score_responses,
)

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


def test_score_responses_matches_notebook_result():
    raw = score_responses(SESSION1_ANSWERS)
    assert raw == {"PC1": -3, "PC2": 3, "PC3": 2, "PC4": 0}


def test_riasec_z_matches_notebook_result():
    z = riasec_z_from_answers(SESSION1_ANSWERS)
    expected = {
        "現実的": 1.89, "研究的": -0.27, "芸術的": -0.77,
        "社会的": -1.43, "企業的": -1.56, "慣習的": 1.26,
    }
    for factor, value in expected.items():
        assert z[factor] == pytest.approx(value, abs=0.02)


def test_recommend_returns_n_jobs_sorted_by_similarity():
    _, jobs = recommend(SESSION1_ANSWERS, n=5)
    assert len(jobs) == 5
    assert list(jobs["similarity"]) == sorted(jobs["similarity"], reverse=True)
    # 06での結果と一致するはず（計器組立が最も類似度が高い）
    assert jobs.iloc[0]["job_name"] == "計器組立"


def test_recommend_missing_answer_raises():
    incomplete = dict(SESSION1_ANSWERS)
    del incomplete["Q1"]
    with pytest.raises(ValueError):
        recommend(incomplete)


def test_render_questions_is_reproducible_for_same_seed():
    a = render_questions(seed="test-seed")
    b = render_questions(seed="test-seed")
    assert a == b


def test_render_questions_differs_across_seeds():
    a = render_questions(seed="seed-1")
    b = render_questions(seed="seed-2")
    assert a != b


def test_display_order_returns_valid_pair():
    order = display_order("Q1", seed="x")
    assert set(order) == {"a", "b"}


def test_explain_has_fallback_for_neutral_profile():
    text = explain({f: 0.0 for f in [
        "現実的", "研究的", "芸術的", "社会的", "企業的", "慣習的",
    ]})
    assert "はっきりした" in text


def test_explain_mentions_dominant_factor():
    z = {"現実的": 1.89, "研究的": -0.27, "芸術的": -0.77,
         "社会的": -1.43, "企業的": -1.56, "慣習的": 1.26}
    text = explain(z)
    assert "道具や機械" in text or "手順やルール" in text
