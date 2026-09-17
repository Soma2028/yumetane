import { motion, type Variants } from "framer-motion"
import { ArrowDown, ArrowRight, BookMarked, BookOpen, Search } from "lucide-react"
import screenshotDiscovery from "../assets/lp/screenshot_discovery.png"
import screenshotHome from "../assets/lp/screenshot_home.png"
import screenshotZukan from "../assets/lp/screenshot_zukan.png"
import { SproutIcon } from "./SproutIcon"

interface Props {
  onStart: () => void
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  show: { opacity: 1, scale: [0, 1.1, 1], transition: { duration: 0.3, ease: "easeOut" } },
}

function stagger(staggerChildren = 0.12): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren, delayChildren: 0.05 } },
  }
}

const viewport = { once: true, amount: 0.25 } as const

export function LandingPage({ onStart }: Props) {
  return (
    <div className="text-charcoal">
      {/* 1. ファーストビュー — PC(lg, 1024px+)は左右2カラム、モバイルは縦積み */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center gap-5 overflow-hidden px-6 py-14 text-center lg:h-screen lg:min-h-0 lg:px-12 lg:py-0 lg:text-left"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(47,107,79,0.06), transparent 70%)",
        }}
      >
        {/* PC版のみ: 右60%を薄いセージ背景にして、明るいモック画像を浮き上がらせる */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-3/5 bg-sage-600/10 lg:block"
        />

        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          animate="show"
          className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-5 lg:flex-row lg:items-center lg:justify-center lg:gap-16"
        >
          <div className="flex flex-col items-center justify-center gap-5 lg:w-2/5 lg:items-start lg:self-stretch">
            <motion.div variants={fadeUp}>
              <SproutIcon className="h-12 w-12 text-sage-600" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold tracking-[-0.02em] lg:text-5xl">
              夢のタネ
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="whitespace-nowrap text-[13px] leading-loose text-charcoal-muted lg:text-xl"
            >
              今日の勉強が、まだ知らない仕事との出会いになる。
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-1 flex flex-col items-center gap-3 lg:flex-row lg:gap-4"
            >
              <FloatingTane
                src="/images/tane/stage1.png"
                alt="双葉が出たタネのキャラクター"
                size={80}
                sizeClassName="h-20 w-20 lg:h-32 lg:w-32"
              />
              <button
                type="button"
                onClick={onStart}
                className="rounded-full bg-coral-500 px-10 py-4 text-lg font-bold text-white shadow-sm transition active:bg-coral-600"
              >
                はじめる
              </button>
            </motion.div>
          </div>

          {/* PC: 右カラムに大きく、モバイル: ボタンの下に小さめに */}
          <motion.img
            variants={fadeUp}
            src={screenshotHome}
            alt="アプリのホーム画面。今日勉強した教科を選ぶ画面"
            className="mt-4 max-h-[36vh] w-auto rounded-2xl border border-border-soft object-contain shadow-sm lg:mt-0 lg:max-h-[78vh] lg:w-3/5"
          />
        </motion.div>
      </section>

      {/* 2. 課題 */}
      <motion.section
        variants={stagger()}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto max-w-2xl px-6 py-20 lg:max-w-3xl lg:py-[120px]"
      >
        <motion.h2
          variants={fadeUp}
          className="text-center text-2xl font-bold tracking-[-0.02em] lg:text-3xl"
        >
          知っている職業が、少ないだけ
        </motion.h2>

        <div className="relative mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
          <motion.p
            variants={fadeUp}
            className="rounded-2xl border border-border-soft bg-white p-5 text-sm leading-loose text-charcoal-muted shadow-sm lg:mr-[-8px] lg:-translate-y-3 lg:text-base"
          >
            小中高校生の子どもを持つ保護者への調査では、「将来の夢を持っていない」と
            回答した割合は中学生が最も高く、22.0%だった
            <br />
            <span className="text-xs text-charcoal-muted">
              （菅公学生服「子どもの将来の夢」調査 カンコーホームルーム Vol.196、2021年7月、子を持つ保護者900名対象）
            </span>
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="rounded-2xl border border-border-soft bg-white p-5 text-sm leading-loose text-charcoal-muted shadow-sm lg:ml-[-8px] lg:translate-y-3 lg:text-base"
          >
            別の調査でも、将来の夢を「持っている」と回答した中学生の割合は、中学1年の
            60.7%から中学3年では46.3%まで下がる
            <br />
            <span className="text-xs text-charcoal-muted">
              （ナガセ「全国統一中学生テスト」付帯アンケート、2020年6月、受験者95,504名対象）
            </span>
          </motion.p>
        </div>

        <motion.div variants={fadeUp} className="mt-12 text-center">
          <p className="text-base font-medium leading-loose lg:text-xl">
            夢が無いのは、意欲が無いからではありません。
            <br />
            多くの場合、知っている職業の数がそもそも少ないだけです。
          </p>
          <p className="mt-3 text-xl font-bold leading-snug tracking-[-0.02em] lg:text-3xl">
            知らない選択肢は、選びようがない。
          </p>
        </motion.div>
      </motion.section>

      {/* 3. 仕組み — PCはタネを上・大きく、テキストを下に */}
      <motion.section
        variants={stagger()}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="bg-white px-6 py-20 lg:py-[120px]"
      >
        <motion.h2
          variants={fadeUp}
          className="text-center text-2xl font-bold tracking-[-0.02em] lg:text-3xl"
        >
          仕組み
        </motion.h2>

        <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-3 lg:mt-14 lg:max-w-5xl lg:flex-row lg:justify-center lg:gap-8">
          <motion.div variants={fadeUp} className="flex items-center gap-2 lg:flex-col lg:gap-4">
            <StepTane
              src="/images/tane/stage0.png"
              alt="タネ（丸い状態）"
              sizeClassName="lg:h-16 lg:w-16"
            />
            <div className="relative flex w-full max-w-[190px] flex-col items-center gap-3 rounded-2xl border border-border-soft p-5 text-center lg:max-w-[240px] lg:p-6">
              <span className="absolute left-4 top-3 text-xs font-bold tracking-wide text-sage-600/50">
                01
              </span>
              <BookOpen className="h-8 w-8 text-sage-600 lg:h-10 lg:w-10" strokeWidth={1.5} />
              <p className="font-bold lg:text-lg">勉強を記録する</p>
              <p className="text-xs text-charcoal-muted lg:text-sm">今日勉強した教科を選ぶだけ</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="lg:hidden">
            <FlowArrow direction="down" />
          </motion.div>
          <motion.div variants={fadeUp} className="hidden lg:block">
            <FlowArrow direction="right" />
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-2 lg:flex-col lg:gap-4">
            <StepTane
              src="/images/tane/stage1.png"
              alt="タネ（双葉が出た状態）"
              sizeClassName="lg:h-16 lg:w-16"
            />
            <div className="relative flex w-full max-w-[190px] flex-col items-center gap-3 rounded-2xl border border-border-soft p-5 text-center lg:max-w-[240px] lg:p-6">
              <span className="absolute left-4 top-3 text-xs font-bold tracking-wide text-sage-600/50">
                02
              </span>
              <Search className="h-8 w-8 text-sage-600 lg:h-10 lg:w-10" strokeWidth={1.5} />
              <p className="font-bold lg:text-lg">関連する職業が見つかる</p>
              <p className="text-xs text-charcoal-muted lg:text-sm">その教科をよく使う仕事を紹介</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="lg:hidden">
            <FlowArrow direction="down" />
          </motion.div>
          <motion.div variants={fadeUp} className="hidden lg:block">
            <FlowArrow direction="right" />
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-2 lg:flex-col lg:gap-4">
            <StepTane
              src="/images/tane/stage2.png"
              alt="タネ（葉が増えた状態）"
              sizeClassName="lg:h-16 lg:w-16"
            />
            <div className="relative flex w-full max-w-[190px] flex-col items-center gap-3 rounded-2xl border border-border-soft p-5 text-center lg:max-w-[240px] lg:p-6">
              <span className="absolute left-4 top-3 text-xs font-bold tracking-wide text-sage-600/50">
                03
              </span>
              <BookMarked className="h-8 w-8 text-sage-600 lg:h-10 lg:w-10" strokeWidth={1.5} />
              <p className="font-bold lg:text-lg">図鑑が埋まっていく</p>
              <p className="text-xs text-charcoal-muted lg:text-sm">気になった仕事は「タネ」に保存</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          className="mx-auto mt-12 max-w-xl rounded-2xl bg-sage-50 px-6 py-5 text-center lg:max-w-2xl lg:py-6"
        >
          <p className="text-base font-medium leading-loose lg:text-lg">
            勉強するたびに、新しい仕事に出会える。
          </p>
        </motion.div>
      </motion.section>

      {/* 4. 画面紹介 — 既存の実装（横並び・中央を大きく）を維持 */}
      <motion.section
        variants={stagger()}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto max-w-4xl px-6 py-20 lg:py-[120px]"
      >
        <motion.h2
          variants={fadeUp}
          className="text-center text-2xl font-bold tracking-[-0.02em] lg:text-3xl"
        >
          画面紹介
        </motion.h2>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-center lg:gap-6">
          <motion.figure
            variants={fadeUp}
            className="flex flex-col items-center gap-3 text-center lg:origin-bottom lg:-rotate-2 lg:scale-95"
          >
            <img
              src={screenshotHome}
              alt="ホーム画面。今日勉強した教科を選ぶ"
              className="w-full max-w-[220px] rounded-2xl border border-border-soft shadow-sm"
            />
            <figcaption className="text-sm text-charcoal-muted">
              今日勉強した教科を選ぶだけ
            </figcaption>
          </motion.figure>
          <motion.figure
            variants={fadeUp}
            className="relative z-10 flex flex-col items-center gap-3 text-center lg:origin-bottom lg:scale-105"
          >
            <img
              src={screenshotDiscovery}
              alt="発見画面。見つかった仕事とタグが表示される"
              className="w-full max-w-[220px] rounded-2xl border border-border-soft shadow-md"
            />
            <figcaption className="text-sm text-charcoal-muted">
              見つかった仕事と、その理由が分かる
            </figcaption>
          </motion.figure>
          <motion.figure
            variants={fadeUp}
            className="flex flex-col items-center gap-3 text-center lg:origin-bottom lg:rotate-2 lg:scale-95"
          >
            <img
              src={screenshotZukan}
              alt="職業図鑑画面。6エリアの発見状況が表示される"
              className="w-full max-w-[220px] rounded-2xl border border-border-soft shadow-sm"
            />
            <figcaption className="text-sm text-charcoal-muted">
              興味の広がりが、6つのエリアで見える
            </figcaption>
          </motion.figure>
        </div>
      </motion.section>

      {/* 5. データについて */}
      <motion.section
        variants={stagger()}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="bg-white px-6 py-20 lg:py-[120px]"
      >
        <div className="mx-auto max-w-2xl">
          <motion.h2
            variants={fadeUp}
            className="text-center text-2xl font-bold tracking-[-0.02em] lg:text-3xl"
          >
            データについて
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col gap-4 text-sm leading-loose text-charcoal-muted lg:text-base"
          >
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
          </motion.div>
        </div>
      </motion.section>

      {/* 6. CTA — PCは文言・タネ・ボタンを横並びに */}
      <motion.section
        variants={stagger()}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="flex flex-col items-center gap-6 px-6 py-24 text-center lg:flex-row lg:justify-center lg:gap-10 lg:py-36"
      >
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center gap-3 lg:flex-row lg:gap-4"
        >
          <FloatingTane src="/images/tane/stage4.png" alt="花が咲いたタネのキャラクター" size={96} />
          <p className="text-lg font-medium leading-loose lg:text-xl">
            今日の勉強を、記録してみませんか。
          </p>
        </motion.div>
        <motion.button
          variants={fadeUp}
          type="button"
          onClick={onStart}
          className="rounded-full bg-coral-500 px-10 py-4 text-lg font-bold text-white shadow-sm transition active:bg-coral-600"
        >
          はじめる
        </motion.button>
      </motion.section>
    </div>
  )
}

function FloatingTane({
  src,
  alt,
  size,
  sizeClassName,
}: {
  src: string
  alt: string
  size: number
  /** レスポンシブにサイズを上書きしたいときのTailwindクラス（例: "h-20 w-20 lg:h-24 lg:w-24"）。 */
  sizeClassName?: string
}) {
  return (
    <motion.img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 rounded-2xl object-contain ${sizeClassName ?? ""}`}
      style={{ mixBlendMode: "multiply" }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  )
}

function StepTane({
  src,
  alt,
  sizeClassName,
}: {
  src: string
  alt: string
  sizeClassName?: string
}) {
  return (
    <motion.img
      variants={popIn}
      src={src}
      alt={alt}
      width={48}
      height={48}
      className={`h-12 w-12 shrink-0 rounded-xl object-contain ${sizeClassName ?? ""}`}
      style={{ mixBlendMode: "multiply" }}
    />
  )
}

function FlowArrow({ direction }: { direction: "down" | "right" }) {
  const Icon = direction === "down" ? ArrowDown : ArrowRight
  return (
    <motion.div
      animate={
        direction === "down"
          ? { y: [0, 4, 0], opacity: [0.4, 1, 0.4] }
          : { x: [0, 4, 0], opacity: [0.4, 1, 0.4] }
      }
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon className="h-6 w-6 shrink-0 text-charcoal-muted" />
    </motion.div>
  )
}
