import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/providers/AuthProvider'
import { publicArticlesApi } from '@/features/articles/api/publicArticles.api'
import { adaptPublicArticle } from '@/features/articles/utils/adaptPublicArticle'

export function useForYouArticles(limit = 6) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const query = useQuery({
    queryKey: ['articles', 'for-you', userId, limit],
    queryFn: async () => {
      const items = await publicArticlesApi.listForYou(limit)
      return items.map((item) => ({ article: adaptPublicArticle(item), reason: item.reason }))
    },
    staleTime: 60_000,
  })

  return { items: query.data ?? [], isLoading: query.isLoading, isError: query.isError }
}
