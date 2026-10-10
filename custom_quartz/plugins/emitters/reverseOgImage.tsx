import { QuartzEmitterPlugin } from "../types"
import { CustomOgImages } from "./ogImage"
import { SocialImageOptions } from "../../util/og"
import { BuildCtx } from "../../util/ctx"

/**
 * 日本語対応 + 『リバース：1999』風デザインの OGP 画像生成プラグイン
 *
 * Quartz 標準の CustomOgImages は、サイトのテーマフォント（Schibsted Grotesk / Source Sans Pro）
 * だけを satori に渡して画像を描画するため、日本語グリフが存在せず tofu（□）になってしまう。
 * このラッパーは OGP 画像生成時に限ってタイポグラフィを日本語フォントへ差し替え、
 * サイト本体のフォント設定には影響を与えずに日本語を正しく描画する。
 */

// OGP 画像生成専用のフォント（Google Fonts から取得し .quartz-cache にキャッシュされる）
const OG_HEADER_FONT = { name: "Noto Serif JP", weights: [700, 900] }
const OG_BODY_FONT = { name: "Noto Sans JP", weights: [400, 700] }

// カラーパレット（アンティーク調の暗色 + 金）
const palette = {
  bg: "#15110e",
  bgGlow: "#3b2a1a",
  gold: "#c9a45c",
  goldDim: "rgba(201, 164, 92, 0.45)",
  goldFaint: "rgba(201, 164, 92, 0.07)",
  ink: "#f1e8d6",
  inkDim: "rgba(241, 232, 214, 0.72)",
  inkFaint: "rgba(241, 232, 214, 0.45)",
}

// トップレベルフォルダ → カテゴリーラベル
const categoryLabels: Record<string, { en: string; ja: string }> = {
  character: { en: "CHARACTER", ja: "人物" },
  event: { en: "EVENT", ja: "事象" },
  place: { en: "PLACE", ja: "地名" },
  story: { en: "STORY", ja: "ストーリー" },
  organization: { en: "ORGANIZATION", ja: "組織" },
}

/** 表示幅の概算（全角 = 1, 半角 = 0.55） */
function visualWidth(text: string): number {
  let w = 0
  for (const ch of text) {
    w += /[\u0000-\u00ff\uff61-\uff9f]/.test(ch) ? 0.55 : 1
  }
  return w
}

/** タイトルの長さに応じてフォントサイズを決める */
function titleFontSize(title: string): number {
  const available = 1000 // タイトル描画領域のおおよその横幅(px)
  const w = visualWidth(title)
  if (w * 96 <= available) return 96
  if (w * 80 <= available) return 80
  if (w * 64 <= available * 2) return 64
  return 52
}

/** wikilink 由来の [ ] などを取り除いて整形する */
function cleanText(text: string): string {
  return text
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * ページ本文から OGP 用の情報を抽出する
 * - subtitle: H1 がタイトル + 補足（例: 「ストーム（The Storm / 暴風雨）」）の場合の補足部分
 * - lead: 見出しを除いた最初の本文段落
 */
function extractFromText(title: string, text: string | undefined) {
  const lines = (text ?? "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  let subtitle: string | undefined
  let startIdx = 0
  if (lines[0]?.startsWith(title)) {
    const rest = lines[0]
      .slice(title.length)
      .trim()
      .replace(/^[（(]\s*(.*?)\s*[）)]$/, "$1")
    if (rest.length > 0 && rest.length <= 40) subtitle = rest
    startIdx = 1
  }

  // 見出し（「概要」など）や箇条書き（「所属: …」など）は避け、文章らしい行を本文とみなす
  const body = lines.slice(startIdx)
  const lead =
    body.find((l) => l.length >= 20 && /[。！？]/.test(l)) ??
    body.find((l) => l.length >= 30 || /[。．.!?！？]$/.test(l))

  return { subtitle, lead: lead ? cleanText(lead) : undefined }
}

const Diamond = ({ size = 10 }: { size?: number }) => (
  <div
    style={{
      display: "flex",
      width: size,
      height: size,
      backgroundColor: palette.gold,
      transform: "rotate(45deg)",
    }}
  />
)

export const reverseImage: SocialImageOptions["imageStructure"] = ({
  cfg,
  title,
  description,
  fileData,
}) => {
  const slug = fileData.slug ?? ""
  const isRoot = slug === "index"
  const topFolder = slug.includes("/") ? slug.split("/")[0] : undefined
  const category = topFolder ? categoryLabels[topFolder] : undefined

  const hasCustomDescription =
    fileData.frontmatter?.socialDescription !== undefined ||
    fileData.frontmatter?.description !== undefined
  const extracted = extractFromText(title, fileData.text)

  const subtitle = isRoot ? "リバース：1999 非公式設定アーカイブ" : extracted.subtitle
  const lead = cleanText(hasCustomDescription ? description : (extracted.lead ?? description))

  const serif = OG_HEADER_FONT.name
  const sans = OG_BODY_FONT.name

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 26,
        backgroundColor: palette.bg,
        backgroundImage: `radial-gradient(circle at 85% 15%, ${palette.bgGlow} 0%, ${palette.bg} 65%)`,
        fontFamily: sans,
        color: palette.ink,
      }}
    >
      {/* 外枠（二重線のアールデコ風フレーム） */}
      <div
        style={{
          display: "flex",
          flex: 1,
          padding: 6,
          border: `2px solid ${palette.gold}`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            position: "relative",
            padding: "36px 52px 32px 52px",
            border: `1px solid ${palette.goldDim}`,
            overflow: "hidden",
          }}
        >
          {/* 背景の大きな「1999」 */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              right: -20,
              bottom: -90,
              fontFamily: serif,
              fontWeight: 900,
              fontSize: 300,
              letterSpacing: -8,
              color: palette.goldFaint,
            }}
          >
            1999
          </div>

          {/* ヘッダー: サイト名 + カテゴリー */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 6,
                color: palette.gold,
              }}
            >
              <Diamond size={9} />
              {isRoot ? "UNOFFICIAL LORE ARCHIVE" : "WORLD OF REVERSE:1999"}
            </div>
            {category && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "6px 18px",
                  border: `1px solid ${palette.gold}`,
                  fontSize: 20,
                  color: palette.gold,
                }}
              >
                <span style={{ letterSpacing: 4, fontWeight: 700 }}>{category.en}</span>
                <span style={{ color: palette.goldDim }}>|</span>
                <span>{category.ja}</span>
              </div>
            )}
          </div>

          {/* タイトル */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: serif,
                fontWeight: 900,
                fontSize: titleFontSize(title),
                lineHeight: 1.2,
                color: palette.ink,
              }}
            >
              <p
                style={{
                  margin: 0,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </p>
            </div>
            {subtitle && (
              <div
                style={{
                  display: "flex",
                  marginTop: 10,
                  fontFamily: serif,
                  fontWeight: 700,
                  fontSize: 30,
                  color: palette.gold,
                }}
              >
                {subtitle}
              </div>
            )}

            {/* 区切り飾り */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 26,
                marginBottom: 22,
              }}
            >
              <div
                style={{ display: "flex", width: 80, height: 1, backgroundColor: palette.gold }}
              />
              <Diamond size={8} />
              <div
                style={{ display: "flex", width: 520, height: 1, backgroundColor: palette.goldDim }}
              />
            </div>

            {/* 本文冒頭 */}
            <div
              style={{
                display: "flex",
                maxWidth: 960,
                fontSize: 26,
                lineHeight: 1.6,
                color: palette.inkDim,
              }}
            >
              <p
                style={{
                  margin: 0,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {lead}
              </p>
            </div>
          </div>

          {/* フッター */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 20,
              color: palette.inkFaint,
            }}
          >
            <div style={{ display: "flex", letterSpacing: 1 }}>{cfg.baseUrl}</div>
            {!isRoot && (
              <div style={{ display: "flex", letterSpacing: 2 }}>非公式設定アーカイブ</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** OGP 画像生成時のみ日本語フォントを使うようにした BuildCtx を返す */
function withJapaneseFonts(ctx: BuildCtx): BuildCtx {
  const configuration = ctx.cfg.configuration
  return {
    ...ctx,
    cfg: {
      ...ctx.cfg,
      configuration: {
        ...configuration,
        theme: {
          ...configuration.theme,
          typography: {
            ...configuration.theme.typography,
            header: OG_HEADER_FONT,
            body: OG_BODY_FONT,
          },
        },
      },
    },
  }
}

export const ReverseOgImages: QuartzEmitterPlugin<Partial<SocialImageOptions>> = (userOpts) => {
  const base = CustomOgImages({ imageStructure: reverseImage, ...userOpts })

  return {
    ...base,
    emit(ctx, content, resources) {
      return base.emit(withJapaneseFonts(ctx), content, resources)
    },
    partialEmit: base.partialEmit
      ? (ctx, content, resources, changeEvents) =>
          base.partialEmit!(withJapaneseFonts(ctx), content, resources, changeEvents)
      : undefined,
  }
}
