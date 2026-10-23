# 夢のタネ

**[デモを見る](https://web-soma2028.vercel.app)**

<p>
  <img src="docs/images/screenshot_lp.png" width="220" alt="ランディングページのファーストビュー">
  <img src="docs/images/screenshot_home.png" width="220" alt="ホーム画面。今日勉強した教科を記録する">
  <img src="docs/images/screenshot_discovery.png" width="220" alt="発見画面。見つかった職業とタグ、job tagへのリンクが表示される">
  <img src="docs/images/screenshot_zukan.png" width="220" alt="職業図鑑画面。6エリアの発見状況が表示される">
</p>

## 何を作ったか

将来の夢がまだ無い中学生向けの、**学習記録 × 職業図鑑**のWebアプリ。
今日勉強した教科を記録すると、その教科をよく使う職業が1件見つかり、職業図鑑に
少しずつ登録されていく。「あなたに合う職業」を当てることを目的にしていない。
**知らなかった職業にどれだけ出会えたか**を評価軸に置いている。

## できること

1. **勉強を記録する** — 教科と時間（10分以上）を記録する。教材名・単元・メモは任意。
   1日に何回でも記録できる
2. **仕事が1つ見つかる** — その日最初の記録のとき、その教科の知識をよく使う職業が
   1件見つかる。まだ知らない職業ほど出やすい（認知度ラベルで3:2:1の重み付き抽選）。
   「この教科を勉強すると就ける」ではなく「この仕事はこの教科をよく使う」と表示し、
   相関を因果のように見せない
3. **職業図鑑に集まる** — 見つけた職業は自動で図鑑に登録される。職業を6つのエリア
   （RIASECの6因子）に分け、エリアごとに何件見つけたかを表示する
4. **もっと知る** — 各職業から、job tag（厚生労働省の職業情報サイト）の職業ページへ
   移動できる。仕事の写真・動画・なり方はそちらで見られる
5. **タネが育つ** — 気になる職業は「タネ」に保存できる。見つけた職業の数に応じて
   タネのキャラクターが5段階で育つ
6. **振り返る** — 「きろく」画面で、過去30日のカレンダー、教科別の勉強時間、
   教科ごとに見つけた職業を振り返れる

ログインは無く、記録はすべて端末の`localStorage`だけに保存する。個人情報を取らない。

スマホのホーム画面に追加でき、追加したアイコンから開くとアプリのように全画面で
ホームから始まる。iOSのSafariは、7日間操作の無いサイトの`localStorage`を消す
（[WebKitのTracking Prevention](https://webkit.org/tracking-prevention/)）が、
ホーム画面に追加したWebアプリはその対象外のため、iPhone・iPadのブラウザで開いている
ときだけホームに追加の手順を案内している。ホーム画面のアプリとSafariのデータは別々に
保存されるため、Safariで記録した分は引き継がれない（書き出し・読み込みは未実装）。
経緯は[docs/design.md](docs/design.md)「データの持ち方」を参照。

## なぜ作ったか

中学生のとき、将来の夢がありませんでした。高校は、
行事が楽しそうだという理由で選びました。将来やりたいことと
結びつけて選んだわけではありません。

データサイエンスという分野があることを知ったのは、
大学のオープンキャンパスです。それまで、この分野の存在自体を
知りませんでした。知らなかったのだから、選択肢に入るはずも
ありませんでした。

塾講師として中学生を教えるようになって、同じ状態の子に
何人も会いました。「将来の夢は?」と聞かれて答えられない子は、
夢を持つ気がないのではありません。知っている職業が数十個しか
ないだけです。その中に自分に合うものがなければ、答えようがない。

このアプリは、夢を決めさせるためのものではありません。
まだ知らない職業に出会う回数を増やすためのものです。

## 技術的な見どころ

1. **job tag（厚労省）167職業のデータ整備と前処理**
   RIASEC（職業興味）データが利用可能な518職業のうち36職業で欠損があった。
   欠損はランダムではなく、ドローンパイロット・データエンジニアなど比較的新しい
   職業に偏っているという構造的な偏りを発見し、知識・仕事の性質のスコアから
   Ridge回帰で補完する方針に転換した。`riasec_source`（実測／推定／推定不能）の
   3値管理で対処し、検証の過程で入力が全欠損の7件が同一の予測値になるバグを
   発見・修正した

2. **学習記録と職業の知識項目の対応設計**
   job tagの「知識」33項目のうち17項目を、数学・国語・理科・社会・英語・美術・
   音楽・技術/家庭の8教科に対応づけた。美術と音楽はjob tag側では「芸術」1項目分
   のスコアしか無いため、同じ候補プールを共有する。保健体育は対応する知識項目が
   構造的にゼロで、埋める手段も無い。「選択肢から外す」のではなく「記録はできるが
   職業発見の対象外」という扱いにし、教科データに`is_special`フラグを
   持たせて表現した

3. **認知度ラベルの設計**
   「子どもの職業認知度」を測った公開データは存在しない。Wikipediaの記事有無・
   ページビューを代理指標として検証したが機能せず、認知度モデルを全職業へ拡張する
   案、RIASEC欠損職業を一律除外する案もそれぞれ検証の上で棄却した。最終的に
   556職業を職業分類で層化抽出した179職業に、1名による実測ラベル（知っている／
   聞いたことがある／知らない）を付与する方式に切り替えた。179件のうち167件が
   RIASECも利用可能で、推薦対象として使っている。3つの案を棄却した経緯は
   [docs/design.md](docs/design.md)に記録している

4. **APIサーバーをやめて、事前計算したJSONに置き換えた**
   当初はFastAPIをRenderの無料枠で動かしていたが、スリープ明けの初回アクセスに
   50秒ほどかかり、デモを開いた人が最初の1分で離れてしまう状態だった。APIが状態を
   持たず`jobs.csv`しか読まないことに着目し、乱数を使わない部分（教科ごとの候補
   プール・抽選の重み・タグ・エリア）をPythonで事前計算してJSONに書き出す構成に
   変えた。フロントは重み付き抽選だけを行う。ロジックの正本はPythonの1か所に保ち、
   JSONの書き出し忘れはテストで検出する。あわせてグラフ用ライブラリを使う画面を
   別ファイルに分け、最初に読み込むJSを701KBから379KB（gzip後214KB→119KB）に減らした

5. **3形式の転換の記録**
   10問クイズ形式 → スワイプ形式 → 学習記録＋職業図鑑、という3段階の構造転換を
   経ている。いずれも設計・実装・検証まで行った上で次に移行しており、何を試し
   何が機能しなかったかという判断の過程は[docs/design.md](docs/design.md)・
   [docs/questions.md](docs/questions.md)に記録している

その他の設計判断（相関を因果に見せない文言設計、`localStorage`のみで状態を持つ
構成、API廃止の経緯、Safariで記録が消える問題への対策など）も[docs/design.md](docs/design.md)にまとめている。

## 技術スタック

| 領域 | 使っているもの |
| --- | --- |
| フロント | React 19 / TypeScript / Vite / Tailwind CSS 4 / Framer Motion / Recharts / lucide-react |
| データ分析・前処理 | Python 3.14 / pandas / NumPy / scikit-learn（Ridge回帰・PCA）/ Jupyter |
| 職業選定ロジック・テスト | Python / FastAPI / pytest |
| 配信 | Vercel（静的サイト。APIサーバーは無い） |
| データ | job tag 職業情報ダウンロードデータ（簡易版数値系 ver.7.00 / 解説系 ver.7.01） |

## 未実施の検証

想定ユーザーである中学生本人によるユーザビリティ検証は未実施（観察タスク・質問・
判断の目安をまとめた検証計画は作成済みで、塾の生徒3〜5人に実施する予定）。「勉強を記録する」
行為が続けたくなるものか、見つかった職業と教科の繋がりが正しく伝わるか
（因果に読み違えられていないか）、抽選の重み3:2:1に納得感があるかなど、
未確認の点は[docs/design.md](docs/design.md)に記録している。

## データ出典

独立行政法人労働政策研究・研修機構（JILPT）作成
職業情報データベース
簡易版数値系ダウンロードデータ ver.7.00 /
解説系ダウンロードデータ ver.7.01
職業情報提供サイト（job tag）より取得
https://shigoto.mhlw.go.jp/User/download

著作権はJILPTが保有。利用規約に基づき、出典明記のうえ二次利用している。
アプリ内の「写真や動画でもっと知る」は、job tagの各職業詳細ページへのリンク
（`https://shigoto.mhlw.go.jp/User/Occupation/Detail/{収録番号}`）で、
写真・動画はアプリには含めていない。
取得日・ファイル構成など詳細は[data/README.md](data/README.md)を参照。

## 構成

### データの流れ

```mermaid
flowchart TD
  raw["job tag 生CSV<br/>data/raw/（Git管理外）"] --> nb["notebooks/01〜08<br/>RIASEC補完・認知度ラベル・<br/>教科スコア"]
  nb --> csv["data/processed/jobs.csv<br/>167職業"]
  csv --> logic["api/app/<br/>候補プール・重み・タグ・エリア"]
  logic --> export["scripts/export_web_data.py"]
  export --> json["web/src/data/jobs.json"]
  json --> web["web/（Vercel）<br/>重み付き抽選・画面"]
  web --> ls[("localStorage<br/>記録・図鑑・タネ")]
  logic -. テスト .- tests["api/tests/"]
```

職業を選ぶロジック（教科ごとの候補プール・認知度の重み・タグ・エリア）は
`api/app/`のPythonで書いている。ただし本番ではAPIサーバーを使わない。
`scripts/export_web_data.py`でこのロジックの結果を`web/src/data/jobs.json`に
書き出し、フロントはそのJSONから重み付きの抽選だけを行う（`web/src/api.ts`）。
経緯は上の「技術的な見どころ」4と[docs/design.md](docs/design.md)を参照。

### ディレクトリ

| パス | 中身 |
| --- | --- |
| `web/` | フロント（React）。`src/components/`に画面、`src/data/jobs.json`に書き出した職業データ |
| `api/app/` | 職業選定ロジック（`discovery.py`・`tags.py`・`areas.py`）と、JSON書き出し用の組み立て（`export.py`）。FastAPIのサーバー（`main.py`）はテストと手元確認用 |
| `api/tests/` | pytest。選定ロジックと、書き出したJSONが最新かを検証する |
| `notebooks/` | データ探索から特徴量の最終組み立てまで（01 探索 → 02 RIASEC欠損補完 → 03〜04 認知度 → 05〜07 質問設計（旧形式） → 08 特徴量・`jobs.csv`出力） |
| `data/` | job tagの生データ（Git管理外）と加工済みデータ |
| `scripts/` | `export_web_data.py`（JSON書き出し）ほか |
| `docs/` | 設計判断の記録（`design.md`）、旧形式の質問設計（`questions.md`）、大人の語彙→子どもの語彙の変換表（`vocab.md`） |

`jobs.csv`や`api/app/`のロジックを変えたら、JSONを書き出し直す。書き出し忘れは
`api/tests/test_export.py`が検出する。

```bash
api/.venv/bin/python3 scripts/export_web_data.py
```

## ローカルで動かす

### フロント

```bash
cd web
npm install
npm run dev
```

`http://localhost:5173` で起動する。APIサーバーの起動は不要。

### API・テスト

```bash
cd api
source .venv/bin/activate
pip install -r requirements-dev.txt  # 初回のみ（notebooks実行やテストも含むフル環境）
pytest
uvicorn app.main:app --reload  # 選定ロジックをHTTP経由で確かめたい場合のみ
```

`data/processed/jobs.csv`（Git管理対象）だけで動くため、これだけならjob tagの
生CSVは不要。notebooksを実行してデータを作り直す場合のみ、job tagの生CSVを
`data/raw/`に手動配置する必要がある（取得元・手順は[data/README.md](data/README.md)参照）。

## デプロイ

### フロント → Vercel

- Root Directory: `web`
- Framework Preset: Vite（自動検出）
- Build Command: `npm run build`
- Output Directory: `dist`
- 環境変数: 不要
