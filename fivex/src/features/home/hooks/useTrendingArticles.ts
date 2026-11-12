import { useQuery } from '@tanstack/react-query'
import { publicArticlesApi } from '@/features/articles/api/publicArticles.api'
import { adaptPublicArticle } from '@/features/articles/utils/adaptPublicArticle'

export function useTrendingArticles(limit = 20) {
  const query = useQuery({
    queryKey: ['articles', 'trending', limit],
    queryFn: () => publicArticlesApi.listTrending(limit),
    select: (articles) => articles.map(adaptPublicArticle),
    staleTime: 60_000,
  })

  return { articles: query.data ?? [], isLoading: query.isLoading, isError: query.isError }
}
