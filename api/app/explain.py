"""推薦理由をRIASECの語彙で説明する。

内部の計算はPCA空間で行うが（scoring.py）、推薦理由の説明には
`PCA.inverse_transform`で戻したRIASEC 6次元の語彙を使う（docs/design.md参照）。

ここの言い回しはdocs/vocab.mdと同じ性質の「言語化」作業の一部で、まだ初稿。
学齢別（小学生/中学生/高校生）の語彙出し分けは未着手。
"""

# 各因子が高い/低いときの説明フレーズ（中学生向け・初稿）
PHRASES = {
    "現実的": {
        "high": "体を動かしたり、道具や機械を扱ったりする仕事に興味がありそう",
        "low": "道具や機械を直接扱う仕事より、人や情報を相手にする仕事の方が合っていそう",
    },
    "研究的": {
        "high": "しくみや理由を調べたり、じっくり考えたりする仕事に興味がありそう",
        "low": "じっくり調べるより、実際に手を動かしたり人と関わったりする仕事の方が合っていそう",
    },
    "芸術的": {
        "high": "自分なりの表現やアイデアを形にする仕事に興味がありそう",
        "low": "自由な表現よりも、決まったやり方や実務をきちんとこなす仕事の方が合っていそう",
    },
    "社会的": {
        "high": "人と関わったり、誰かの力になったりする仕事に興味がありそう",
        "low": "人と関わることより、物や情報を相手にする仕事の方が合っていそう",
    },
    "企業的": {
        "high": "人を動かしたり、リーダーシップを取ったりする仕事に興味がありそう",
        "low": "自分から人を引っ張るより、決められたことを着実にこなす仕事の方が合っていそう",
    },
    "慣習的": {
        "high": "決まった手順やルールを大事にしながら進める仕事に興味がありそう",
        "low": "決まった手順よりも、自由なやり方で進める仕事の方が合っていそう",
    },
}

# これ未満の|z|は「はっきりした傾向ではない」として説明に使わない
MIN_Z_FOR_EXPLANATION = 0.3
MAX_FACTORS_IN_EXPLANATION = 2


def explain(riasec_z: dict) -> str:
    """riasec_z: {"現実的": z値, ...} の6因子。上位|z|の因子から説明文を組み立てる。"""
    ranked = sorted(riasec_z.items(), key=lambda kv: abs(kv[1]), reverse=True)
    picked = [(f, z) for f, z in ranked if abs(z) >= MIN_Z_FOR_EXPLANATION][:MAX_FACTORS_IN_EXPLANATION]

    if not picked:
        return "はっきりした好みの方向はまだ出ていません。いろんな職業を見てみましょう。"

    sentences = []
    for factor, z in picked:
        direction = "high" if z > 0 else "low"
        sentences.append(PHRASES[factor][direction])

    return "、".join(sentences) + "。"
