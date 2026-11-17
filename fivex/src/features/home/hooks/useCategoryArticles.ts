import { useQuery } from '@tanstack/react-query'
import { publicArticlesApi } from '@/features/articles/api/publicArticles.api'
import { adaptPublicArticle } from '@/features/articles/utils/adaptPublicArticle'

export function useCategoryArticles(slug: string, limit: number) {
  const query = useQuery({
    queryKey: ['articles', 'category', slug],
    queryFn: () => publicArticlesApi.listByCategory(slug),
    select: (articles) => articles.slice(0, limit).map(adaptPublicArticle),
    staleTime: 60_000,
  })

  return { articles: query.data ?? [], isLoading: query.isLoading, isError: query.isError }
}
