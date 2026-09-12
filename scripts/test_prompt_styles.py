"""共通プロンプト3案の比較用テストスクリプト（本番のgenerate_images.pyとは別）。

1〜2職業について、3つの画風で試し生成し、見比べるためのもの。
OPENAI_API_KEY環境変数が必要（DALL-E 3を使用）。

使い方:
    source api/.venv/bin/activate
    python3 scripts/test_prompt_styles.py
"""

import base64
import os
import sys

from openai import OpenAI

STYLE_A = (
    "A minimalist flat vector icon illustration in a modern app-icon style. "
    "Solid, flat cream background (#FBF8F3), no scenery or horizon. "
    "Use only this color palette: cream #FBF8F3, sage green #2F6B4F, coral "
    "orange #E8734A, plus white and a dark charcoal for outlines — no "
    "gradients, no shading, no texture, no photorealism. Bold, clean, "
    "uniform-width outlines around simple flat geometric shapes. Do not draw "
    "any human face or figure; represent the profession purely through its "
    "tools, equipment, and objects, arranged in a simple, symmetrical, "
    "centered composition. No text, no logos, no watermarks, no borders."
)

STYLE_B = (
    "A flat, friendly vector illustration in a modern editorial style, like "
    "a picture-book scene. Flat cream background (#FBF8F3) with soft, "
    "simple shapes suggesting an environment (no detailed background "
    "clutter). Primary palette: cream #FBF8F3, sage green #2F6B4F, coral "
    "orange #E8734A, supplemented with soft neutral tones (light gray, warm "
    "beige) for secondary shapes — no gradients, no photorealistic shading, "
    "flat color fills only. If a person appears, show only a simple "
    "faceless silhouette (a rounded flat shape with no facial features), "
    "small and secondary to the surrounding tools and objects, which remain "
    "the visual focus. Rounded, soft shapes throughout. No text, no logos, "
    "no watermarks."
)

STYLE_C = (
    "A flat vector icon designed as a circular badge or emblem, like a "
    "modern app icon. The badge has a solid cream background (#FBF8F3) "
    "filling a perfect circle with a thin sage green (#2F6B4F) border ring. "
    "Inside the circle, depict the profession's key tools and objects using "
    "a limited flat palette: sage green #2F6B4F, coral orange #E8734A, "
    "white, and dark charcoal outlines only — no gradients, no shading, no "
    "texture. Layered flat shapes may slightly overlap to suggest depth, "
    "like paper cutouts, but with no drop shadows or gradients. Do not "
    "include any human face; if a figure appears, it must be a plain "
    "faceless silhouette, small and secondary. No text, no letters, no "
    "logos, no watermark. The background outside the circle should be "
    "plain white."
)

STYLES = {"A_icon": STYLE_A, "B_scene": STYLE_B, "C_badge": STYLE_C}

TEST_JOBS = [
    ("パティシエ", "洋菓子店や菓子工場で洋菓子を製造する。"),
    ("計器組立", "長さ、質量、温度、圧力、流量、体積などの量を表示、指示、記録する器具である計器を組み立てる。"),
]

OUT_DIR = "scripts/test_output"
COST_PER_IMAGE = 0.04


def build_prompt(style_text: str, job_name: str, description: str) -> str:
    return (
        f"{style_text}\n\n"
        f"Depict the profession: {job_name}. {description} "
        "Show the objects and tools most associated with this work."
    )


def main():
    n_images = len(STYLES) * len(TEST_JOBS)
    cost = n_images * COST_PER_IMAGE
    print(f"{n_images}枚 × ${COST_PER_IMAGE:.2f} = 約${cost:.2f} を生成します。")
    if input("続けますか？ [y/N]: ").strip().lower() != "y":
        print("中止しました。")
        return

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY が設定されていません。", file=sys.stderr)
        sys.exit(1)

    client = OpenAI(api_key=api_key)
    os.makedirs(OUT_DIR, exist_ok=True)

    for style_id, style_text in STYLES.items():
        for job_name, description in TEST_JOBS:
            prompt = build_prompt(style_text, job_name, description)
            out_path = f"{OUT_DIR}/{style_id}_{job_name}.png"
            print(f"生成中: {out_path}")
            try:
                result = client.images.generate(
                    model="dall-e-3",
                    prompt=prompt,
                    size="1024x1024",
                    quality="standard",
                    n=1,
                    response_format="b64_json",
                )
                image_bytes = base64.b64decode(result.data[0].b64_json)
                with open(out_path, "wb") as f:
                    f.write(image_bytes)
                print(f"  保存しました: {out_path}")
            except Exception as e:
                print(f"  失敗: {e}", file=sys.stderr)

    print(f"\n完了。{OUT_DIR}/ を見比べてください。")


if __name__ == "__main__":
    main()
