import { Link } from 'react-router-dom'
import type { Article } from '@/shared/types/article.types'
import dayjs from '@/lib/dayjs'

export function LatestPostsList({ articles }: { articles: Article[] }) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-4">
      <h3 className="text-sm font-semibold text-card-heading mb-4">Latest Posts</h3>
      <ul className="flex flex-col gap-4">
        {articles.map((article) => (
          <li key={article.id}>
            <Link to={`/article/${article.slug}`} className="flex gap-3 group">
              <div className="w-14 h-14 rounded-lg bg-card-2 shrink-0 border border-card-border overflow-hidden">
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
    </div>
  )
}