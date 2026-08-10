import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useCategories } from '../hooks/useCategories'
import { publicArticlesApi } from '@/features/articles/api/publicArticles.api'
import { adaptPublicArticle } from '@/features/articles/utils/adaptPublicArticle'
import { ArticleCard } from '@/features/home/components/ArticleCard'
import { FEATURED_ARTICLE, LATEST_POSTS, TRENDING_ARTICLES } from '@/features/home/data/mockHome'
import type { Article } from '@/shared/types/article.types'

const MOCK_POOL: Article[] = [FEATURED_ARTICLE, ...LATEST_POSTS, ...TRENDING_ARTICLES]

export function CategoryPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { categories } = useCategories()

  const category = categories.find((c) => c.slug === slug)

  const { data: realArticles = [], isLoading } = useQuery({
    queryKey: ['articles', 'category', slug],
    queryFn: () => publicArticlesApi.listByCategory(slug),
    enabled: Boolean(slug),
  })

  const adaptedReal = useMemo(() => realArticles.map(adaptPublicArticle), [realArticles])

  // Fills out the page with related mock stories in this category so it
  // isn't sparse while real published articles are still being written —
  // real articles are always shown first.
  const mockFill = useMemo(() => {
    const realIds = new Set(adaptedReal.map((a) => a.id))
    return MOCK_POOL.filter(
      (article) => article.category.slug === slug && !realIds.has(article.id),
    )
  }, [adaptedReal, slug])

  const articles = [...adaptedReal, ...mockFill]

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Link to="/" className="text-xs text-text-muted hover:text-accent transition-colors w-fit">
          &larr; Back to Home
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold text-heading">
          {category?.name ?? 'Category'}
        </h1>
        <p className="text-sm text-text-muted">
          Stories filed under {category?.name ?? 'this category'}.
        </p>
      </div>

      {isLoading && <p className="text-sm text-text-muted">Loading articles...</p>}

      {!isLoading && articles.length === 0 && (
        <p className="text-sm text-text-muted">No stories in this category yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
