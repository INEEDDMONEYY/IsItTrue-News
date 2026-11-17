import { Link } from 'react-router-dom'
import type { Category } from '@/shared/types/article.types'
import dayjs from '@/lib/dayjs'
import { useCategoryArticles } from '../hooks/useCategoryArticles'

const CATEGORY_ROW_SIZE = 4

export function CategoryRow({ category }: { category: Category }) {
  const { articles, isLoading, isError } = useCategoryArticles(category.slug, CATEGORY_ROW_SIZE)

  return (
    <section aria-labelledby={`category-row-${category.slug}`}>
      <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
        <h2
          id={`category-row-${category.slug}`}
          className="text-xs font-bold uppercase tracking-widest text-heading"
        >
          {category.name}
        </h2>
        <Link
          to={`/category/${category.slug}`}
          className="text-xs text-accent hover:text-accent-hover transition-colors"
        >
          View all »
        </Link>
      </div>

      {isError ? (
        <p className="text-sm text-text-muted">Couldn't load {category.name} stories right now.</p>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 animate-pulse" aria-busy="true">
          {Array.from({ length: CATEGORY_ROW_SIZE }, (_, index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-[4/3] rounded-lg bg-card-2" />
              <div className="h-3 w-1/3 rounded bg-card-2" />
              <div className="h-3 rounded bg-card-2" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-sm text-text-muted">No published {category.name} stories yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {articles.map((article) => (
            <Link key={article.id} to={`/article/${article.slug}`} className="group flex flex-col gap-3">
              <div className="aspect-[4/3] rounded-lg bg-card-2 overflow-hidden">
                <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] uppercase tracking-wide font-semibold text-accent">
                {category.name}
              </span>
              <h3 className="text-base font-semibold text-heading leading-snug group-hover:text-accent transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-text-muted">{dayjs(article.publishedAt).format('MMM D, YYYY')}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
