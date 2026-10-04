import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

interface GithubSourceOptions {
  repoUrl: string
  branch: string
  viewText: string
  editText: string
  showView: boolean
  showEdit: boolean
}

const defaultOptions: GithubSourceOptions = {
  repoUrl: "https://github.com/kojisaiki/world-of-reverse1999",
  branch: "main",
  viewText: "ソース確認",
  editText: "編集依頼",
  showView: true,
  showEdit: true,
}

export default ((opts?: Partial<GithubSourceOptions>) => {
  const options: GithubSourceOptions = { ...defaultOptions, ...opts }

  const GithubSource: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    // markdown ファイルの実体パスを取得
    const rawPath =
      fileData.relativePath ??
      (fileData.filePath ? fileData.filePath.replace(/^content\//, "") : undefined)

    if (!rawPath) {
      return null
    }

    // Windows のバックスラッシュ対応とURLエンコード
    const normalizedPath = rawPath.replace(/\\/g, "/")
    const encodedPath = normalizedPath.split("/").map(encodeURIComponent).join("/")

    const baseUrl = options.repoUrl.replace(/\/$/, "")
    const blobUrl = `${baseUrl}/blob/${options.branch}/${encodedPath}`
    const editUrl = `${baseUrl}/edit/${options.branch}/${encodedPath}`

    return (
      <div class={classNames(displayClass, "github-source")}>
        <span class="github-source-label">
          <svg
            class="github-icon"
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
          <span>GitHub:</span>
        </span>
        {options.showView && (
          <a
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="github-source-link github-source-view"
            title="GitHubでこのページのMarkdownソースを表示"
          >
            {options.viewText}
            <svg
              class="external-icon"
              viewBox="0 0 24 24"
              width="11"
              height="11"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        )}
        {options.showView && options.showEdit && <span class="github-source-separator">/</span>}
        {options.showEdit && (
          <a
            href={editUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="github-source-link github-source-edit"
            title="GitHubでこのページの編集・Pull Request作成"
          >
            {options.editText}
            <svg
              class="external-icon"
              viewBox="0 0 24 24"
              width="11"
              height="11"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        )}
      </div>
    )
  }

  GithubSource.css = `
  .github-source {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.35rem;
    font-size: 0.8rem;
    color: var(--darkgray);
    margin-top: 0.2rem;
    margin-bottom: 0.6rem;
  }

  .github-source-label {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-weight: 600;
    color: var(--darkgray);
  }

  .github-icon {
    display: inline-block;
    vertical-align: text-bottom;
  }

  .github-source-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--secondary);
    text-decoration: none;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    background-color: var(--highlight);
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background-color: var(--lightgray);
      text-decoration: underline;
    }
  }

  .external-icon {
    display: inline-block;
    vertical-align: middle;
    opacity: 0.75;
  }

  .github-source-separator {
    color: var(--gray);
    font-size: 0.75rem;
  }
  `

  return GithubSource
}) satisfies QuartzComponentConstructor
