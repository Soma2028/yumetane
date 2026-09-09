# データ

## 取得元

職業情報提供サイト（job tag）職業情報ダウンロード
https://shigoto.mhlw.go.jp/User/download

`data/raw/` はGit管理外です。上記ページから以下の2ファイル（csv版）を
ダウンロードし、`data/raw/` に配置してください。

| ファイル | バージョン | 公開日 |
|---|---|---|
| IPD_DL_numeric_7_00.csv（簡易版数値系） | 7.00 | 2026年3月17日 |
| IPD_DL_description_7_01.csv（解説系） | 7.01 | 2026年6月4日 |

取得日: 2026年9月9日

## 出典

独立行政法人労働政策研究・研修機構（JILPT）作成 職業情報データベース
簡易版数値系ダウンロードデータ ver.7.00 / 解説系ダウンロードデータ ver.7.01
職業情報提供サイト（job tag）より2026年9月9日にダウンロード
（https://shigoto.mhlw.go.jp/User/download）を加工して作成

著作権はJILPTが保有。利用規約に基づき、出典明記のうえ二次利用しています。

## 構成

- `raw/` — 取得したままのCSV（cp932）。Git管理外
- `processed/` — 加工済みデータ。Git管理対象
