"""質問の採点 → PCA逆変換 → 推薦、までの一連の処理。

notebooks/07_question_randomization.ipynb / 08_feature_matrix.ipynb で検証した
ロジックをそのまま移植している。data/processed/riasec_transform.json だけを
入力に動くため、notebookやscikit-learnの学習済みモデルには依存しない。
"""

import hashlib
import random

import numpy as np
import pandas as pd

from .data import load_jobs, load_transform


def get_questions() -> list[dict]:
    return load_transform()["questions"]


def display_order(question_id: str, seed: str) -> tuple[str, str]:
    """("a","b") か ("b","a") を返す。表示上、先頭に出す方が最初の要素。

    同じseedなら同じ並びを再現できる（docs/questions.md参照）。
    """
    h = hashlib.sha256(f"{seed}:{question_id}".encode()).hexdigest()
    rnd = random.Random(h)
    return ("a", "b") if rnd.random() < 0.5 else ("b", "a")


def render_questions(seed: str) -> list[dict]:
    """UIに渡す形（1番目/2番目の表示テキスト）に並び替えた質問一覧。"""
    rendered = []
    for q in get_questions():
        first, second = display_order(q["id"], seed)
        labels = {"a": q["option_a"], "b": q["option_b"]}
        rendered.append({
            "id": q["id"],
            "choice_1": labels[first],
            "choice_2": labels[second],
        })
    return rendered


def _match_choice(question: dict, chosen_text: str) -> str:
    text = chosen_text.strip()
    if text == question["option_a"].strip():
        return "a"
    if text == question["option_b"].strip():
        return "b"
    raise ValueError(f"{question['id']}: 選択肢と一致しない回答: {chosen_text!r}")


def score_responses(answers: dict[str, str]) -> dict[str, int]:
    """answers: {question_id: 選んだ選択肢の文言（表示順に関わらず内容そのもの）}"""
    transform = load_transform()
    raw = {axis: 0 for axis in transform["axis_n"]}
    for q in transform["questions"]:
        if q["id"] not in answers:
            raise ValueError(f"未回答の質問があります: {q['id']}")
        ab = _match_choice(q, answers[q["id"]])
        sign = 1 if ab == q["positive"] else -1
        raw[q["axis"]] += sign
    return raw


def riasec_z_from_answers(answers: dict[str, str]) -> dict[str, float]:
    """10問の回答から、RIASEC 6因子のzスコアを返す。"""
    transform = load_transform()
    raw = score_responses(answers)

    pc_vec = np.zeros(len(transform["pc_std"]))
    for axis, score in raw.items():
        idx = transform["axis_to_pc_index"][axis]
        frac = score / transform["axis_n"][axis]
        pc_vec[idx] = frac * transform["scale_sd"] * transform["pc_std"][idx]

    components = np.array(transform["pca_components"])
    mean = np.array(transform["pca_mean"])
    riasec_z = pc_vec @ components + mean

    return dict(zip(transform["riasec_cols"], riasec_z.tolist()))


def recommend(answers: dict[str, str], n: int = 5) -> tuple[dict[str, float], pd.DataFrame]:
    """回答からRIASEC zベクトルを求め、類似度の高い職業を上位n件返す。

    戻り値: (riasec_z辞書, 職業n件のDataFrame。similarity列付き、similarity降順)
    """
    riasec_z = riasec_z_from_answers(answers)

    jobs = load_jobs()
    z_cols = [f"riasec_{f}_z" for f in riasec_z]
    job_vectors = jobs[z_cols].values
    user_vector = np.array(list(riasec_z.values()))

    norms = np.linalg.norm(job_vectors, axis=1) * np.linalg.norm(user_vector)
    norms[norms == 0] = 1e-9
    similarity = (job_vectors @ user_vector) / norms

    result = jobs.copy()
    result["similarity"] = similarity
    result = result.sort_values("similarity", ascending=False).head(n).reset_index(drop=True)

    return riasec_z, result
