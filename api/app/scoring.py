"""スワイプ形式のカード選択・ユーザー位置推定・推薦。

10問クイズ形式（notebooks/05〜08, docs/questions.md）は設計・検証した上で、
「知らない職業に出会う」という目的に対して体験として合わないと判断し廃止した。
経緯はdocs/design.mdを参照。

以下の定数（LEFT_SWIPE_WEIGHT, EXPLOIT_WEIGHT_CAP, AWARENESS_WEIGHT,
EXPLOIT_DECAY, TOP_K_FOR_SELECTION, MAX_CARDS）はいずれも暫定値であり、
検証はしていない。docs/design.mdに明記している。
"""

import math
import random

import numpy as np
import pandas as pd

from .data import load_jobs
from .tags import select_tags

RIASEC_FACTORS = ["現実的", "研究的", "芸術的", "社会的", "企業的", "慣習的"]
Z_COLS = [f"riasec_{f}_z" for f in RIASEC_FACTORS]

LEFT_SWIPE_WEIGHT = 0.4
EXPLOIT_WEIGHT_CAP = 0.55
AWARENESS_WEIGHT = 0.25
EXPLOIT_DECAY = 5.0
TOP_K_FOR_SELECTION = 3
MAX_CARDS = 30

AWARENESS_BONUS = {
    "知らない": 1.0,
    "名前は聞いたことがある": 0.5,
    "知っている": 0.0,
}


def _job_pool() -> pd.DataFrame:
    # jobs.csvは既に推薦対象（RIASEC利用可能かつ認知度ラベルあり）167件に
    # 絞ってある。カタログ用の職業（認知度ラベルが無いもの）は候補に含めない
    # ——awareness_bonusが与えられないため、優先順位付けの意図が保てなくなる。
    return load_jobs()


def _dedupe_history(history: list[dict]) -> list[dict]:
    seen = set()
    deduped = []
    for h in history:
        if h["job_id"] in seen:
            continue
        seen.add(h["job_id"])
        deduped.append(h)
    return deduped


def estimate_position(history: list[dict]) -> np.ndarray:
    """スワイプ履歴から現在のユーザー位置（RIASEC zベクトル、6次元）を推定する。

    右スワイプした職業の重心に寄せ、左スワイプした職業からは重み
    LEFT_SWIPE_WEIGHTで離す。履歴が空なら原点（母集団平均）を返す。
    """
    history = _dedupe_history(history)
    jobs = _job_pool().set_index("job_id")

    acc = np.zeros(len(Z_COLS))
    total_weight = 0.0

    for h in history:
        if h["job_id"] not in jobs.index:
            continue
        vec = jobs.loc[h["job_id"], Z_COLS].to_numpy(dtype=float)
        if h["direction"] == "right":
            acc += vec
            total_weight += 1.0
        else:
            acc -= LEFT_SWIPE_WEIGHT * vec
            total_weight += LEFT_SWIPE_WEIGHT

    if total_weight == 0:
        return np.zeros(len(Z_COLS))
    return acc / total_weight


def _normalize(values: np.ndarray) -> np.ndarray:
    lo, hi = values.min(), values.max()
    if hi - lo < 1e-9:
        return np.full_like(values, 0.5)
    return (values - lo) / (hi - lo)


def next_card(history: list[dict]) -> dict | None:
    """スワイプ履歴から次に見せるカード（職業1件）を選ぶ。

    候補が尽きた場合、またはMAX_CARDS枚に達した場合はNoneを返す
    （クライアントは結果画面に誘導する）。
    """
    history = _dedupe_history(history)
    if len(history) >= MAX_CARDS:
        return None

    jobs = _job_pool()
    shown_ids = {h["job_id"] for h in history}
    candidates = jobs[~jobs["job_id"].isin(shown_ids)].reset_index(drop=True)
    if candidates.empty:
        return None

    n = len(history)
    position = estimate_position(history)
    candidate_vectors = candidates[Z_COLS].to_numpy(dtype=float)

    if np.linalg.norm(position) < 1e-9:
        exploit_raw = np.zeros(len(candidates))
    else:
        norms = np.linalg.norm(candidate_vectors, axis=1) * np.linalg.norm(position)
        norms[norms == 0] = 1e-9
        exploit_raw = (candidate_vectors @ position) / norms
    exploit = _normalize(exploit_raw)

    if shown_ids:
        shown_vectors = jobs[jobs["job_id"].isin(shown_ids)][Z_COLS].to_numpy(dtype=float)
    else:
        # 何も見せていない最初の1枚は、原点からの距離で代用する
        shown_vectors = np.zeros((1, len(Z_COLS)))
    dists = np.linalg.norm(candidate_vectors[:, None, :] - shown_vectors[None, :, :], axis=2)
    explore = _normalize(dists.min(axis=1))

    awareness_bonus = candidates["awareness_label"].map(AWARENESS_BONUS).fillna(0.0).to_numpy()

    w_exploit = EXPLOIT_WEIGHT_CAP * (1 - math.exp(-n / EXPLOIT_DECAY))
    w_explore = 1 - w_exploit - AWARENESS_WEIGHT

    scores = w_exploit * exploit + w_explore * explore + AWARENESS_WEIGHT * awareness_bonus

    top_k = min(TOP_K_FOR_SELECTION, len(candidates))
    top_idx = np.argsort(scores)[-top_k:]
    chosen_idx = random.choice(top_idx.tolist())
    row = candidates.iloc[chosen_idx]

    return {
        "job_id": int(row.job_id),
        "job_name": row.job_name,
        "description": row.description,
        "riasec_source": row.riasec_source,
        "awareness_label": row.awareness_label,
        "tags": select_tags(row),
    }


def result_from_history(history: list[dict], n_jobs: int = 20) -> tuple[dict, pd.DataFrame]:
    """スワイプ履歴から推薦職業と説明を返す（中間結果・最終結果で共用）。"""
    history = _dedupe_history(history)
    position = estimate_position(history)
    riasec_z = dict(zip(RIASEC_FACTORS, position.tolist()))

    jobs = _job_pool()
    job_vectors = jobs[Z_COLS].to_numpy(dtype=float)

    if np.linalg.norm(position) < 1e-9:
        similarity = np.zeros(len(jobs))
    else:
        norms = np.linalg.norm(job_vectors, axis=1) * np.linalg.norm(position)
        norms[norms == 0] = 1e-9
        similarity = (job_vectors @ position) / norms

    result = jobs.copy()
    result["similarity"] = similarity
    result = result.sort_values("similarity", ascending=False).head(n_jobs).reset_index(drop=True)

    return riasec_z, result
