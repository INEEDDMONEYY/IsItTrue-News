
import {
  ArrowUpRight,
  FileText,
  Newspaper,
} from 'lucide-react'

import type { CaseFileLinkedItem } from '../types/caseFile.types'

interface CaseFileArticlesProps {
  articles: CaseFileLinkedItem[]
  loading?: boolean
  onArticleClick?: (article: CaseFileLinkedItem) => void
  emptyMessage?: string
}

const getStatusStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'published':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'

    case 'draft':
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'

    case 'in editorial review':
    case 'pending':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'

    default:
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
  }
}

export function CaseFileArticles({
  articles,
  loading = false,
  onArticleClick,
  emptyMessage = 'No articles have been linked to this case file yet.',
}: CaseFileArticlesProps) {
  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading articles">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="size-10 shrink-0 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-3 w-1/3 rounded bg-neutral-100 dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 px-5 py-10 text-center dark:border-neutral-800">
        <Newspaper
          size={24}
          className="mx-auto text-neutral-400"
        />
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => {
        const content = (
          <>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              <FileText size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-white">
                  {article.title}
                </h4>

                {article.status && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${getStatusStyle(
                      article.status,
                    )}`}
                  >
                    {article.status}
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                <span>{article.type}</span>

                {article.id && (
                  <span className="truncate">
                    ID: {article.id}
                  </span>
                )}
              </div>

              {article.description && (
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  {article.description}
                </p>
              )}
            </div>

            {(onArticleClick || article.url) && (
              <ArrowUpRight
                size={16}
                className="shrink-0 text-neutral-400"
              />
            )}
          </>
        )

        if (onArticleClick) {
          return (
            <button
              key={article.id}
              type="button"
              onClick={() => onArticleClick(article)}
              className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left transition-colors hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/50 sm:p-4"
            >
              {content}
            </button>
          )
        }

        if (article.url) {
          return (
            <a
              key={article.id}
              href={article.url}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/50 sm:p-4"
            >
              {content}
            </a>
          )
        }

        return (
          <div
            key={article.id}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900 sm:p-4"
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}

export default CaseFileArticles
