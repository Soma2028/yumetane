"""職業図鑑の6エリア（RIASEC因子）。

スワイプ形式ではRIASECベクトルへの類似度で推薦していたが、学習記録方式ではその役目が
無くなった。代わりに、各職業のRIASEC 6因子のうち最もzスコアが高いものを「その職業の
エリア」とみなし、図鑑画面でエリアごとの踏破率を表示する。新規データは不要で、既存の
riasec_*_z列から求まる（docs/design.md「RIASECの再利用：職業図鑑の6エリア」参照）。
"""

import pandas as pd

RIASEC_FACTORS = ["現実的", "研究的", "芸術的", "社会的", "企業的", "慣習的"]


def dominant_area(row: pd.Series) -> str:
    z_values = {f: row[f"riasec_{f}_z"] for f in RIASEC_FACTORS}
    return max(z_values, key=z_values.get)


def area_counts(jobs: pd.DataFrame) -> dict[str, int]:
    """167職業（全体）を、エリアごとに何件あるかのマップ。図鑑の踏破率の分母に使う。"""
    areas = jobs.apply(dominant_area, axis=1)
    counts = areas.value_counts().to_dict()
    return {f: int(counts.get(f, 0)) for f in RIASEC_FACTORS}
