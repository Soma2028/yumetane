import numpy as np
import pytest

from app.data import load_jobs
from app.scoring import (
    LEFT_SWIPE_WEIGHT,
    MAX_CARDS,
    Z_COLS,
    estimate_position,
    next_card,
    result_from_history,
)

JOBS = load_jobs()
JOB_A = int(JOBS.iloc[0].job_id)  # 洋菓子製造、パティシエ
JOB_B = int(JOBS.iloc[1].job_id)  # ハム・ソーセージ・ベーコン製造
JOB_C = int(JOBS.iloc[2].job_id)  # ワイン製造


def _vector(job_id: int) -> np.ndarray:
    row = JOBS[JOBS["job_id"] == job_id].iloc[0]
    return row[Z_COLS].to_numpy(dtype=float)


def test_estimate_position_empty_history_is_origin():
    pos = estimate_position([])
    assert np.allclose(pos, np.zeros(len(Z_COLS)))


def test_estimate_position_single_right_swipe_equals_job_vector():
    pos = estimate_position([{"job_id": JOB_A, "direction": "right"}])
    assert np.allclose(pos, _vector(JOB_A))


def test_estimate_position_right_swipe_centroid():
    pos = estimate_position([
        {"job_id": JOB_A, "direction": "right"},
        {"job_id": JOB_B, "direction": "right"},
    ])
    expected = (_vector(JOB_A) + _vector(JOB_B)) / 2
    assert np.allclose(pos, expected)


def test_estimate_position_left_swipe_pulls_away_with_reduced_weight():
    pos = estimate_position([
        {"job_id": JOB_A, "direction": "right"},
        {"job_id": JOB_B, "direction": "left"},
    ])
    expected = (_vector(JOB_A) - LEFT_SWIPE_WEIGHT * _vector(JOB_B)) / (1 + LEFT_SWIPE_WEIGHT)
    assert np.allclose(pos, expected)


def test_estimate_position_ignores_duplicate_job_id():
    once = estimate_position([{"job_id": JOB_A, "direction": "right"}])
    twice = estimate_position([
        {"job_id": JOB_A, "direction": "right"},
        {"job_id": JOB_A, "direction": "right"},
    ])
    assert np.allclose(once, twice)


def test_next_card_excludes_already_shown():
    history = [{"job_id": JOB_A, "direction": "right"}]
    card = next_card(history)
    assert card is not None
    assert card["job_id"] != JOB_A


def test_next_card_never_repeats_across_a_long_session():
    history: list[dict] = []
    seen = set()
    for _ in range(50):
        card = next_card(history)
        if card is None:
            break
        assert card["job_id"] not in seen
        seen.add(card["job_id"])
        history.append({"job_id": card["job_id"], "direction": "right"})


def test_next_card_stops_at_max_cards():
    history = [{"job_id": int(row.job_id), "direction": "right"} for row in JOBS.iloc[:MAX_CARDS].itertuples()]
    assert len(history) == MAX_CARDS
    assert next_card(history) is None


def test_next_card_returns_none_when_pool_exhausted():
    history = [{"job_id": int(jid), "direction": "right"} for jid in JOBS["job_id"]]
    assert next_card(history) is None


def test_result_from_history_riasec_matches_position():
    history = [{"job_id": JOB_A, "direction": "right"}]
    riasec_z, jobs = result_from_history(history)
    expected = dict(zip(
        ["現実的", "研究的", "芸術的", "社会的", "企業的", "慣習的"],
        _vector(JOB_A).tolist(),
    ))
    for factor, value in expected.items():
        assert riasec_z[factor] == pytest.approx(value)
    assert len(jobs) <= 20
    assert list(jobs["similarity"]) == sorted(jobs["similarity"], reverse=True)


def test_result_from_history_empty_history_is_neutral():
    riasec_z, jobs = result_from_history([])
    assert all(v == 0.0 for v in riasec_z.values())
    assert len(jobs) <= 20
