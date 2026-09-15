import { ArrowDown, ArrowRight, BookMarked, BookOpen, Search } from "lucide-react"
import screenshotDiscovery from "../assets/lp/screenshot_discovery.png"
import screenshotHome from "../assets/lp/screenshot_home.png"
import screenshotZukan from "../assets/lp/screenshot_zukan.png"
import { SproutIcon } from "./SproutIcon"

interface Props {
  onStart: () => void
}

export function LandingPage({ onStart }: Props) {
  return (
    <div className="text-charcoal">
      {/* 1. ファーストビュー */}
      <section className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <SproutIcon className="h-12 w-12 text-sage-600" />
        <h1 className="text-4xl font-bold tracking-tight">夢のタネ</h1>
        <p className="max-w-sm text-lg leading-loose text-charcoal-muted">
          今日の勉強が、まだ知らない仕事との出会いになる。
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-2 rounded-full bg-coral-500 px-10 py-4 text-lg font-bold text-white shadow-sm transition active:bg-coral-600"
        >
          はじめる
        </button>
        <img
          src={screenshotHome}
          alt="アプリのホーム画面。今日勉強した教科を選ぶ画面"
          className="mt-6 w-48 rounded-2xl border border-border-soft shadow-sm sm:w-56"
        />
      </section>

      {/* 2. 課題 */}
      <section className="mx-auto max-w-2xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          知っている職業が、少ないだけ
        </h2>

        <div className="mt-8 flex flex-col gap-4">
          <p className="rounded-2xl border border-border-soft bg-white p-5 text-sm leading-loose text-charcoal-muted sm:text-base">
            小中高校生の子どもを持つ保護者への調査では、「将来の夢を持っていない」と回答した割合は中学生が最も高く、22.0%だった
            <br />
            <span className="text-xs text-charcoal-muted">
              （菅公学生服「子どもの将来の夢」調査 カンコーホームルーム Vol.196、2021年7月、子を持つ保護者900名対象）
            </span>
          </p>
          <p className="rounded-2xl border border-border-soft bg-white p-5 text-sm leading-loose text-charcoal-muted sm:text-base">
            別の調査でも、将来の夢を「持っている」と回答した中学生の割合は、中学1年の60.7%から中学3年では46.3%まで下がる
            <br />
            <span className="text-xs text-charcoal-muted">
              （ナガセ「全国統一中学生テスト」付帯アンケート、2020年6月、受験者95,504名対象）
            </span>
          </p>
        </div>

        <p className="mt-8 text-center text-base font-medium leading-loose sm:text-lg">
          夢が無いのは、意欲が無いからではありません。
          <br />
          多くの場合、知っている職業の数がそもそも少ないだけです。
          <br />
          知らない選択肢は、選びようがない。
        </p>
      </section>

      {/* 3. 仕組み */}
      <section className="bg-white px-6 py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">仕組み</h2>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <div className="flex w-full max-w-[220px] flex-col items-center gap-3 rounded-2xl border border-border-soft p-5 text-center">
            <BookOpen className="h-8 w-8 text-sage-600" strokeWidth={1.5} />
            <p className="font-bold">勉強を記録する</p>
            <p className="text-xs text-charcoal-muted">今日勉強した教科を選ぶだけ</p>
          </div>

          <ArrowDown className="h-6 w-6 shrink-0 text-charcoal-muted sm:hidden" />
          <ArrowRight className="hidden h-6 w-6 shrink-0 text-charcoal-muted sm:block" />

          <div className="flex w-full max-w-[220px] flex-col items-center gap-3 rounded-2xl border border-border-soft p-5 text-center">
            <Search className="h-8 w-8 text-sage-600" strokeWidth={1.5} />
            <p className="font-bold">関連する職業が見つかる</p>
            <p className="text-xs text-charcoal-muted">その教科をよく使う仕事を紹介</p>
          </div>

          <ArrowDown className="h-6 w-6 shrink-0 text-charcoal-muted sm:hidden" />
          <ArrowRight className="hidden h-6 w-6 shrink-0 text-charcoal-muted sm:block" />

          <div className="flex w-full max-w-[220px] flex-col items-center gap-3 rounded-2xl border border-border-soft p-5 text-center">
            <BookMarked className="h-8 w-8 text-sage-600" strokeWidth={1.5} />
            <p className="font-bold">図鑑が埋まっていく</p>
            <p className="text-xs text-charcoal-muted">気になった仕事は「タネ」に保存</p>
          </div>
        </div>

        <p className="mt-10 text-center text-base font-medium leading-loose sm:text-lg">
          勉強するたびに、新しい仕事に出会える。
        </p>
      </section>

      {/* 4. 画面紹介 */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">画面紹介</h2>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          <figure className="flex flex-col items-center gap-3 text-center">
            <img
              src={screenshotHome}
              alt="ホーム画面。今日勉強した教科を選ぶ"
              className="w-full max-w-[220px] rounded-2xl border border-border-soft shadow-sm"
            />
            <figcaption className="text-sm text-charcoal-muted">
              今日勉強した教科を選ぶだけ
            </figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-3 text-center">
            <img
              src={screenshotDiscovery}
              alt="発見画面。見つかった仕事とタグが表示される"
              className="w-full max-w-[220px] rounded-2xl border border-border-soft shadow-sm"
            />
            <figcaption className="text-sm text-charcoal-muted">
              見つかった仕事と、その理由が分かる
            </figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-3 text-center">
            <img
              src={screenshotZukan}
              alt="職業図鑑画面。6エリアの発見状況が表示される"
              className="w-full max-w-[220px] rounded-2xl border border-border-soft shadow-sm"
            />
            <figcaption className="text-sm text-charcoal-muted">
              興味の広がりが、6つのエリアで見える
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 5. データについて */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            データについて
          </h2>
          <div className="mt-8 flex flex-col gap-4 text-sm leading-loose text-charcoal-muted sm:text-base">
            <p>
              職業の情報は、独立行政法人労働政策研究・研修機構（JILPT）が公開する職業情報提供サイト「job
              tag」の職業情報データベースを加工して使用しています。
            </p>
            <p>
              教科と職業の関連は、job
              tagが調査した「実際にその職業に就いている人が、どの知識をどれくらい使っているか」というデータをもとに算出したものです。ここで示す「関連」は、その職業に就いている人が実際にその知識を使っているという意味であり、「その教科を勉強すればその職業に就ける」という意味ではありません。
            </p>
            <p className="text-xs">
              出典：独立行政法人労働政策研究・研修機構（JILPT）作成 職業情報データベース、職業情報提供サイト（job
              tag）より取得・加工して作成
            </p>
          </div>
        </div>
      </section>

      {/* 6. CTA */}
      <section className="flex flex-col items-center gap-6 px-6 py-24 text-center">
        <p className="text-lg font-medium leading-loose sm:text-xl">
          今日の勉強を、記録してみませんか。
        </p>
        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-coral-500 px-10 py-4 text-lg font-bold text-white shadow-sm transition active:bg-coral-600"
        >
          はじめる
        </button>
      </section>
    </div>
  )
}
