"""学習記録から職業を1件見つける。

10問クイズ形式・スワイプ形式（exploit/explore/awareness_bonusによる次カード選択）は
いずれも設計・検証の上で廃止した。経緯はdocs/design.mdを参照。

以下の定数（TOP_N_PER_SUBJECT, WEIGHT_BY_AWARENESS）は暫定値であり、検証していない。
docs/design.mdに明記している。
"""

from .areas import dominant_area
from .data import load_jobs
from .tags import select_tags

STUDIABLE_SUBJECTS = ["数学", "理科", "社会", "国語", "英語", "美術・音楽", "技術・家庭"]

TOP_N_PER_SUBJECT = 30

WEIGHT_BY_AWARENESS = {
    "知らない": 3,
    "名前は聞いたことがある": 2,
    "知っている": 1,
}


def discover_job(subject: str, known_job_ids: list[int]) -> dict | None:
    """指定した教科の候補プール（教科スコア上位TOP_N_PER_SUBJECT件）から、
    まだ図鑑に無いものを認知度で重み付けして1件選ぶ。

    その教科の候補プールをすべて図鑑登録済みならNoneを返す
    （クライアントは「この教科の職業はぜんぶ見つけたよ」に誘導する）。
    """
    if subject not in STUDIABLE_SUBJECTS:
        raise ValueError(f"対応していない教科です: {subject}")

    jobs = load_jobs()
    col = f"subject_{subject}_z"
    subject_pool = jobs.nlargest(TOP_N_PER_SUBJECT, col)

    candidates = subject_pool[~subject_pool["job_id"].isin(known_job_ids)]
    if candidates.empty:
        return None

    weights = candidates["awareness_label"].map(WEIGHT_BY_AWARENESS).fillna(1)
    row = candidates.sample(n=1, weights=weights).iloc[0]

    return {
        "job_id": int(row.job_id),
        "job_name": row.job_name,
        "description": row.description,
        "riasec_source": row.riasec_source,
        "awareness_label": row.awareness_label,
        "tags": select_tags(row),
        "area": dominant_area(row),
    }
