"""notebooks/08_feature_matrix.ipynb が書き出した jobs.csv を読み込む。

このモジュールはnotebookに依存せず、data/processed/jobs.csv だけで動く。
"""

from functools import lru_cache
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"
JOBS_PATH = DATA_DIR / "jobs.csv"


@lru_cache(maxsize=1)
def load_jobs() -> pd.DataFrame:
    return pd.read_csv(JOBS_PATH)
