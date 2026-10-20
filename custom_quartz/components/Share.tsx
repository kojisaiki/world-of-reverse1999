import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../../quartz/components/types"
import { classNames } from "../../quartz/util/lang"

interface ShareOptions {
  siteUrl: string
  hashtags: string[]
  shareText: string
}

const defaultOptions: ShareOptions = {
  siteUrl: "https://kojisaiki.github.io/world-of-reverse1999",
  hashtags: ["リバース1999", "reverse1999"],
  shareText: "",
}

export default ((opts?: Partial<ShareOptions>) => {
  const options: ShareOptions = { ...defaultOptions, ...opts }

  const Share: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const slug = fileData.slug ?? fileData.relativePath?.replace(/\.md$/i, "") ?? ""
    const pagePath = slug.replace(/(^|\/)index$/i, "$1")
    const encodedPagePath = pagePath
      .split("/")
      .filter(Boolean)
      .map(encodeURIComponent)
      .join("/")
    const siteUrl = options.siteUrl.replace(/\/$/, "")
    const pageUrl = encodedPagePath ? `${siteUrl}/${encodedPagePath}` : siteUrl
    const title = fileData.frontmatter?.title ?? slug.split("/").pop() ?? "World of Reverse:1999"
    const text = [options.shareText || title, ...options.hashtags.map((tag) => `#${tag}`)].join(" ")
    const shareUrl = new URL("https://twitter.com/intent/tweet")
    shareUrl.searchParams.set("text", text)
    shareUrl.searchParams.set("url", pageUrl)

    return (
      <div class={classNames(displayClass, "page-share")}>
        <span class="page-share-label">このページを共有:</span>
        <a
          class="page-share-link"
          href={shareUrl.toString()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`「${title}」をXで共有`}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
            <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.6 22H2.5l7.3-8.4L1.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
          </svg>
          <span>Xでポスト</span>
        </a>
      </div>
    )
  }

  Share.css = `
  .page-share {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.2rem 0 0.8rem;
    font-size: 0.8rem;
    color: var(--darkgray);
  }

  .page-share-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.55rem;
    border-radius: 4px;
    color: var(--dark);
    background: var(--highlight);
    text-decoration: none;
    transition: background-color 0.15s ease;

    &:hover {
      background: var(--lightgray);
      text-decoration: underline;
    }
  }
  `

  return Share
}) satisfies QuartzComponentConstructor
