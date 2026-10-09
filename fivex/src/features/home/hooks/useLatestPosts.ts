import { useQuery } from '@tanstack/react-query'
import { publicArticlesApi } from '@/features/articles/api/publicArticles.api'
import { adaptPublicArticle } from '@/features/articles/utils/adaptPublicArticle'

export function useLatestPosts(limit = 5) {
  const query = useQuery({
    queryKey: ['articles', 'latest', limit],
    queryFn: () => publicArticlesApi.listLatest(limit),
    select: (articles) => articles.map(adaptPublicArticle),
    staleTime: 60_000,
  })

  return { articles: query.data ?? [], isLoading: query.isLoading, isError: query.isError }
}
