"""notebooks/08_feature_matrix.ipynb が書き出した成果物を読み込む。

このモジュールはnotebookに依存せず、data/processed/ 配下の2ファイルだけで動く。
"""

from functools import lru_cache
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"
JOBS_PATH = DATA_DIR / "jobs.csv"
TRANSFORM_PATH = DATA_DIR / "riasec_transform.json"


@lru_cache(maxsize=1)
def load_jobs() -> pd.DataFrame:
    return pd.read_csv(JOBS_PATH)


@lru_cache(maxsize=1)
def load_transform() -> dict:
    import json

    with open(TRANSFORM_PATH, encoding="utf-8") as f:
        return json.load(f)
