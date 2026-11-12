import { useQuery } from '@tanstack/react-query'
import { publicArticlesApi } from '@/features/articles/api/publicArticles.api'
import { adaptPublicArticle } from '@/features/articles/utils/adaptPublicArticle'

export function useFeaturedArticle() {
  const query = useQuery({
    queryKey: ['articles', 'featured'],
    queryFn: () => publicArticlesApi.getFeatured(),
    select: (article) => (article ? adaptPublicArticle(article) : null),
    staleTime: 60_000,
  })

  return { article: query.data ?? null, isLoading: query.isLoading }
}
