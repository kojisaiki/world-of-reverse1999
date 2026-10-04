import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import GithubSource from "./quartz/components/GithubSource"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.ConditionalRender({
      component: Component.Graph({
        localGraph: {
          drag: true,
          zoom: true,
          depth: -1,
          scale: 1.1,
          repelForce: 2.0,
          centerForce: 0.08,
          linkDistance: 120,
          fontSize: 0.75,
          opacityScale: 3.5,
          showTags: false,
          focusOnHover: true,
          enableRadial: false,
        },
        globalGraph: {
          showTags: false,
          depth: -1,
          linkDistance: 280,
          repelForce: 4.0,
          centerForce: 0.03,
          fontSize: 1.1,
          opacityScale: 3.5,
          scale: 1.2,
          focusOnHover: true,
          enableRadial: false,
        },
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
  ],
  footer: Component.Footer({
    links: {
      "GitHub リポジトリ": "https://github.com/kojisaiki/world-of-reverse1999",
      "編集・貢献ガイド": "https://kojisaiki.github.io/world-of-reverse1999/contribution",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    GithubSource(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.ConditionalRender({
      component: Component.Graph({
        localGraph: {
          showTags: false,
          linkDistance: 90,     // ノード同士の距離を広げる（デフォルト30）
          repelForce: 1.5,      // 反発力を強めて重なりを防ぐ（デフォルト0.5）
          centerForce: 0.08,    // 中心にギュッと引き寄せる力を弱める（デフォルト0.3）
          focusOnHover: true,   // ホバーしたノードの繋がりをハイライト
          scale: 1.1,
        },
        globalGraph: {
          showTags: false,
          depth: 1,             // 拡大時も現在のページに繋がったノードのみを表示
          linkDistance: 280,    // ★大画面に合わせてノード間の距離を大幅拡大（画面端まで広げる）
          repelForce: 4.0,      // ★反発力を強めて画面全体に展開
          centerForce: 0.03,    // ★中心に集まる引力を最小限に抑制
          fontSize: 1.1,        // ★大画面で見やすいフォントサイズ
          opacityScale: 3.5,    // ★拡大時に最初からラベル文字がクッキリ読めるようにする
          scale: 1.2,
          focusOnHover: true,
          enableRadial: false,
        },
      }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    GithubSource(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
