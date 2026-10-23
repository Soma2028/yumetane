"""フロントが読む web/src/data/jobs.json を、api/app/ の選定ロジックから書き出す。

Renderの無料枠はアイドル時にスリープし、初回アクセスに50秒ほどかかっていた。
APIはステートレスで jobs.csv しか読まないため、教科ごとの候補プール・抽選の重み・
タグ・エリアをここで事前計算し、フロントは抽選（重み付きサンプリング）だけを行う。
定数（TOP_N_PER_SUBJECT, WEIGHT_BY_AWARENESS等）の正本は引き続き api/app/ にある。

jobs.csv や api/app/ の選定ロジックを変えたら、このスクリプトを再実行する
（api/tests/test_export.py が、書き出し済みのJSONとのずれを検出する）。

使い方:
    api/.venv/bin/python3 scripts/export_web_data.py
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "api"))

from app.export import build_web_data  # noqa: E402

OUT_PATH = ROOT / "web" / "src" / "data" / "jobs.json"


def main() -> None:
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(build_web_data(), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"wrote {OUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
