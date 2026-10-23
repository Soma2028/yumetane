"""jobs.csvの1行を、APIレスポンス・フロント用JSONで共通の職業データ（JobOut相当）にする。"""

import pandas as pd

from .areas import dominant_area
from .tags import select_tags

# job tagの職業詳細ページ。{}にはjob tagの収録番号（jobs.csvのjobtag_no）が入る。
# job_idは別物（518職業の通し番号）なので使えない（notebooks/08_feature_matrix.ipynb参照）
JOBTAG_DETAIL_URL = "https://shigoto.mhlw.go.jp/User/Occupation/Detail/{}"


def job_to_dict(row: pd.Series) -> dict:
    return {
        "job_id": int(row.job_id),
        "job_name": row.job_name,
        "description": row.description,
        "riasec_source": row.riasec_source,
        "awareness_label": row.awareness_label,
        "tags": select_tags(row),
        "area": dominant_area(row),
        "jobtag_url": JOBTAG_DETAIL_URL.format(int(row.jobtag_no)),
    }
