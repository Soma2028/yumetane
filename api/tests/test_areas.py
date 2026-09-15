from app.areas import RIASEC_FACTORS, area_counts, dominant_area
from app.data import load_jobs

JOBS = load_jobs()


def test_dominant_area_is_one_of_six_factors():
    for _, row in JOBS.iterrows():
        assert dominant_area(row) in RIASEC_FACTORS


def test_area_counts_sum_to_total_jobs():
    counts = area_counts(JOBS)
    assert set(counts.keys()) == set(RIASEC_FACTORS)
    assert sum(counts.values()) == len(JOBS)


def test_area_counts_all_nonzero():
    # 167件もあれば、6因子すべてに最低1件は割り当たるはず
    counts = area_counts(JOBS)
    assert all(v > 0 for v in counts.values())
