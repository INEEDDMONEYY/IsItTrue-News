import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTags } from '../hooks/useTags'
import { publicArticlesApi } from '@/features/articles/api/publicArticles.api'
import { adaptPublicArticle } from '@/features/articles/utils/adaptPublicArticle'
import { ArticleCard } from '@/features/home/components/ArticleCard'
import { TRENDING_ARTICLES } from '@/features/home/data/mockHome'
import { usePagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/ui/Pagination'

const PAGE_SIZE = 6

export function TagPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { tags } = useTags()

  const tag = tags.find((t) => t.slug === slug)

  const { data: realArticles = [], isLoading } = useQuery({
    queryKey: ['articles', 'tag', slug],
    queryFn: () => publicArticlesApi.listByTag(slug),
    enabled: Boolean(slug),
  })

  const adaptedReal = useMemo(() => realArticles.map(adaptPublicArticle), [realArticles])

  // Mock articles don't carry real tags, so we can't honestly claim any of
  // them belong to this tag — instead, once real tagged stories run out we
  // fill the rest of the page with trending mock stories as a "you might
  // also like" section rather than pretending they match the tag.
  const trendingFill = TRENDING_ARTICLES.filter(
    (article) => !adaptedReal.some((real) => real.id === article.id),
  )
  const { page, setPage, totalPages, paginatedItems } = usePagination(
    trendingFill,
    PAGE_SIZE,
    slug,
  )

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Link to="/" className="text-xs text-text-muted hover:text-accent transition-colors w-fit">
          &larr; Back to Home
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold text-heading">
          #{tag?.name ?? 'Tag'}
        </h1>
        <p className="text-sm text-text-muted">Stories tagged {tag?.name ?? 'with this tag'}.</p>
      </div>

      {isLoading && <p className="text-sm text-text-muted">Loading articles...</p>}

      {!isLoading && adaptedReal.length === 0 && (
        <p className="text-sm text-text-muted">No stories tagged with this yet.</p>
      )}

      {adaptedReal.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adaptedReal.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2 border-t border-border">
        <h2 className="text-sm font-semibold text-heading">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
