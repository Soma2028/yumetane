from app.data import load_jobs
from app.tags import (
    MAX_RIASEC_TAGS,
    MAX_TAGS,
    RIASEC_TAGS,
    WORK_CONTEXT_TAGS,
    select_tags,
)

JOBS = load_jobs()


def _category_of(label: str) -> str | None:
    for category, items in WORK_CONTEXT_TAGS.items():
        for _col, item_label in items:
            if item_label == label:
                return category
    return None


def _is_riasec_label(label: str) -> bool:
    return any(label == item_label for _col, item_label in RIASEC_TAGS)


def test_selects_at_most_max_tags():
    for _, row in JOBS.iterrows():
        tags = select_tags(row)
        assert len(tags) <= MAX_TAGS


def test_no_two_tags_share_a_work_context_category():
    for _, row in JOBS.iterrows():
        tags = select_tags(row)
        categories = [_category_of(t) for t in tags if _category_of(t) is not None]
        assert len(categories) == len(set(categories))


def test_at_most_one_riasec_tag():
    for _, row in JOBS.iterrows():
        tags = select_tags(row)
        riasec_count = sum(1 for t in tags if _is_riasec_label(t))
        assert riasec_count <= MAX_RIASEC_TAGS


def test_tags_are_the_highest_scoring_valid_candidates():
    # 手動で候補を並べ、貪欲選択の結果と一致するか、既知の職業で確認する
    row = JOBS.iloc[0]
    tags = select_tags(row)

    candidates = []
    for category, items in WORK_CONTEXT_TAGS.items():
        for col, label in items:
            candidates.append((row[col], label, category))
    for col, label in RIASEC_TAGS:
        candidates.append((row[col], label, None))
    candidates.sort(key=lambda c: c[0], reverse=True)

    expected = []
    used_categories = set()
    riasec_used = False
    for _score, label, category in candidates:
        if len(expected) >= MAX_TAGS:
            break
        if category is None:
            if riasec_used:
                continue
            expected.append(label)
            riasec_used = True
        else:
            if category in used_categories:
                continue
            expected.append(label)
            used_categories.add(category)

    assert tags == expected


def test_all_jobs_get_at_least_one_tag():
    # 25候補もあれば、カテゴリ制約下でも最低1つは選べるはず
    for _, row in JOBS.iterrows():
        assert len(select_tags(row)) >= 1
