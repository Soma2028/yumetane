"""フロント（web/src/data/jobs.json）向けのデータを組み立てる。

POST /discover の抽選のうち、乱数を使わない部分（教科ごとの候補プールと重み）と、
GET /subjects・GET /areas・GET /jobs/{id} の返す内容を事前計算する。
書き出しは scripts/export_web_data.py が行う。
"""

from .areas import area_counts
from .data import load_jobs
from .discovery import ALL_SUBJECTS, SPECIAL_SUBJECTS, STUDIABLE_SUBJECTS, TOP_N_PER_SUBJECT, WEIGHT_BY_AWARENESS, score_column
from .job_dict import job_to_dict


def build_web_data() -> dict:
    jobs = load_jobs()

    # discover_jobと同じく、教科スコア上位TOP_N_PER_SUBJECT件を候補プールにし、
    # 認知度ラベルから重みを付ける（未知のラベルは1）。
    pools = {}
    for subject in STUDIABLE_SUBJECTS:
        pool = jobs.nlargest(TOP_N_PER_SUBJECT, score_column(subject))
        pools[subject] = [
            {"job_id": int(row.job_id), "weight": WEIGHT_BY_AWARENESS.get(row.awareness_label, 1)}
            for row in pool.itertuples()
        ]

    return {
        "subjects": [{"name": s, "is_special": s in SPECIAL_SUBJECTS} for s in ALL_SUBJECTS],
        "areas": area_counts(jobs),
        "pools": pools,
        "jobs": [job_to_dict(row) for _, row in jobs.iterrows()],
    }
