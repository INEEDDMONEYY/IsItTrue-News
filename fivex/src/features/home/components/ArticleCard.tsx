import { Link } from 'react-router-dom'
import type { Article } from '@/shared/types/article.types'
import dayjs from '@/lib/dayjs'

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col rounded-2xl border border-card-border bg-card overflow-hidden hover:border-accent-border transition-colors"
    >
      <div className="aspect-[4/3] bg-card-2 overflow-hidden">
        <img
          src={article.thumbnailUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <span className="text-[11px] uppercase tracking-wide font-medium text-accent w-fit">
          {article.category.name}
        </span>
        <h4 className="text-sm font-semibold text-card-heading leading-snug group-hover:text-accent transition-colors">
          {article.title}
        </h4>
        {article.excerpt && (
          <p className="text-xs text-card-text-dim leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        )}
        <p className="text-xs text-card-text-dim mt-1">
          {dayjs(article.publishedAt).format('MMM D')} ·{' '}
          {article.readTimeMinutes} min read
        </p>
      </div>
    </Link>
  )
}