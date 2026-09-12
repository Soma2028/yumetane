"""カードに表示する職業タグ（3つ）の選定。

タグ候補は「仕事の性質」から選んだ19項目＋RIASEC6因子の合計25。
選定基準・カテゴリ分けの根拠はdocs/vocab.md「職業タグ」を参照。
data/processed/jobs.csv には、選定済みの19項目のzスコア（`workctx_*_z`列）と
RIASECのzスコア（`riasec_*_z`列）が入っている。
"""

import pandas as pd

# category -> [(column, label), ...]
WORK_CONTEXT_TAGS: dict[str, list[tuple[str, str]]] = {
    "body": [
        ("workctx_外で働く_z", "外で働く"),
        ("workctx_座って集中_z", "座って集中"),
        ("workctx_立ち仕事_z", "立ち仕事"),
        ("workctx_歩き回る仕事_z", "歩き回る仕事"),
    ],
    "social": [
        ("workctx_人と関わる_z", "人と関わる"),
        ("workctx_チームで動く_z", "チームで動く"),
        ("workctx_お客さんと話す_z", "お客さんと話す"),
        ("workctx_みんなをまとめる_z", "みんなをまとめる"),
    ],
    "schedule": [
        ("workctx_スピード勝負_z", "スピード勝負"),
        ("workctx_決まった予定で動く_z", "決まった予定で動く"),
        ("workctx_毎日ちがう_z", "毎日ちがう"),
    ],
    "responsibility": [
        ("workctx_結果に責任を持つ_z", "結果に責任を持つ"),
        ("workctx_人の安全を守る_z", "人の安全を守る"),
    ],
    "precision": [
        ("workctx_正確さが大事_z", "正確さが大事"),
        ("workctx_コツコツ続ける_z", "コツコツ続ける"),
    ],
    "autonomy": [
        ("workctx_自分で決められる_z", "自分で決められる"),
    ],
    "tools": [
        ("workctx_特別な装備を使う_z", "特別な装備を使う"),
        ("workctx_手先を使う_z", "手先を使う"),
    ],
    "technology": [
        ("workctx_機械と働く_z", "機械と働く"),
    ],
}

RIASEC_TAGS: list[tuple[str, str]] = [
    ("riasec_現実的_z", "ものづくり"),
    ("riasec_研究的_z", "しくみを調べる"),
    ("riasec_芸術的_z", "表現する"),
    ("riasec_社会的_z", "人を助ける"),
    ("riasec_企業的_z", "リーダーになる"),
    ("riasec_慣習的_z", "きちんと進める"),
]

MAX_TAGS = 3
MAX_RIASEC_TAGS = 1


def select_tags(row: pd.Series) -> list[str]:
    """1職業分の行から、カテゴリ制約・RIASEC上限を守って上位3つのタグを選ぶ。"""
    candidates: list[tuple[float, str, str | None]] = []
    for category, items in WORK_CONTEXT_TAGS.items():
        for col, label in items:
            candidates.append((float(row[col]), label, category))
    for col, label in RIASEC_TAGS:
        candidates.append((float(row[col]), label, None))  # None = RIASEC由来

    candidates.sort(key=lambda c: c[0], reverse=True)

    selected: list[str] = []
    used_categories: set[str] = set()
    riasec_count = 0

    for _score, label, category in candidates:
        if len(selected) >= MAX_TAGS:
            break
        if category is None:
            if riasec_count >= MAX_RIASEC_TAGS:
                continue
            selected.append(label)
            riasec_count += 1
        else:
            if category in used_categories:
                continue
            selected.append(label)
            used_categories.add(category)

    return selected
