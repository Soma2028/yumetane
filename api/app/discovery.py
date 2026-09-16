"""学習記録から職業を1件見つける。

10問クイズ形式・スワイプ形式（exploit/explore/awareness_bonusによる次カード選択）は
いずれも設計・検証の上で廃止した。経緯はdocs/design.mdを参照。

以下の定数（TOP_N_PER_SUBJECT, WEIGHT_BY_AWARENESS）は暫定値であり、検証していない。
docs/design.mdに明記している。
"""

from .areas import dominant_area
from .data import load_jobs
from .tags import select_tags

# discover対象の教科（8教科）。保健体育は対応する知識項目が無いため含まない。
# GET /subjectsでは保健体育も含めた9教科を返すが、is_special=Trueとして
# クライアント側でPOST /discoverを呼ばないよう誘導する（docs/design.md参照）。
STUDIABLE_SUBJECTS = ["数学", "国語", "理科", "社会", "英語", "美術", "音楽", "技術・家庭"]

# GET /subjectsにのみ表示する、discover対象外の教科。
SPECIAL_SUBJECTS = ["保健体育"]

ALL_SUBJECTS = STUDIABLE_SUBJECTS + SPECIAL_SUBJECTS

TOP_N_PER_SUBJECT = 30

WEIGHT_BY_AWARENESS = {
    "知らない": 3,
    "名前は聞いたことがある": 2,
    "知っている": 1,
}

# job tag側は「芸術」1項目分の知識スコアしか持たないため、美術・音楽は
# どちらで記録しても同じ列（notebooks/08_feature_matrix.ipynbで作成した
# subject_美術・音楽_z）を参照する。データ列自体は再生成せず、教科名→列名の
# マッピングだけをここで吸収する。
_SCORE_COLUMN_OVERRIDE = {
    "美術": "subject_美術・音楽_z",
    "音楽": "subject_美術・音楽_z",
}


def score_column(subject: str) -> str:
    return _SCORE_COLUMN_OVERRIDE.get(subject, f"subject_{subject}_z")


def discover_job(subject: str, known_job_ids: list[int]) -> dict | None:
    """指定した教科の候補プール（教科スコア上位TOP_N_PER_SUBJECT件）から、
    まだ図鑑に無いものを認知度で重み付けして1件選ぶ。

    その教科の候補プールをすべて図鑑登録済みならNoneを返す
    （クライアントは「この教科の職業はぜんぶ見つけたよ」に誘導する）。
    """
    if subject not in STUDIABLE_SUBJECTS:
        raise ValueError(f"対応していない教科です: {subject}")

    jobs = load_jobs()
    col = score_column(subject)
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
