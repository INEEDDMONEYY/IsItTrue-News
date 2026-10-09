import { Link } from 'react-router-dom'
import type { Article } from '@/shared/types/article.types'
import dayjs from '@/lib/dayjs'

interface LatestPostsListProps {
  articles: Article[]
  isLoading?: boolean
  isError?: boolean
}

export function LatestPostsList({ articles, isLoading = false, isError = false }: LatestPostsListProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-card-heading mb-4">Latest Posts</h3>

      {isLoading ? (
        <ul className="flex flex-col gap-4" aria-busy="true" aria-label="Loading latest posts">
          {Array.from({ length: 5 }, (_, index) => (
            <li key={index} className="flex gap-3 animate-pulse">
              <div className="w-14 h-14 rounded-lg bg-card-2 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded bg-card-2" />
                <div className="h-3 w-2/3 rounded bg-card-2" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <p role="alert" className="text-sm text-card-text-dim">
          Couldn&apos;t load the latest posts. Please try again shortly.
        </p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-card-text-dim">No posts have been published yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {articles.map((article) => (
            <li key={article.id}>
              <Link to={`/article/${article.slug}`} className="flex gap-3 group">
                <div className="w-14 h-14 rounded-lg bg-card-2 shrink-0 border border-border overflow-hidden">
                  <img
                    src={article.thumbnailUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-card-text leading-snug line-clamp-2 group-hover:text-card-heading transition-colors">
                    {article.title}
                  </p>
                  <p className="text-xs text-card-text-dim mt-1">
                    {dayjs(article.publishedAt).format('MMM D')} ·{' '}
                    {article.readTimeMinutes} min read
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
