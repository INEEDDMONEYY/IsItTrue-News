import { useMutation, useQueryClient } from '@tanstack/react-query'
import { publicArticlesApi } from '../api/publicArticles.api'

/**
 * Wires the like/dislike/share buttons on a real (backend-sourced) article
 * to /api/articles/:id/{like,dislike,share}. Invalidates the article's
 * "by slug" query on success so the refreshed counts/liked/disliked state
 * flow back down from the server.
 */
export function useArticleEngagement(articleId: string | undefined, slug: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = ['articles', 'slug', slug]

  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  const likeMutation = useMutation({
    mutationFn: () => publicArticlesApi.toggleLike(articleId!),
    onSuccess: invalidate,
  })

  const dislikeMutation = useMutation({
    mutationFn: () => publicArticlesApi.toggleDislike(articleId!),
    onSuccess: invalidate,
  })

  const shareMutation = useMutation({
    mutationFn: () => publicArticlesApi.share(articleId!),
    onSuccess: invalidate,
  })

  const bookmarkMutation = useMutation({
    mutationFn: () => publicArticlesApi.toggleBookmark(articleId!),
    onSuccess: invalidate,
  })

  return {
    toggleLike: () => likeMutation.mutate(),
    toggleDislike: () => dislikeMutation.mutate(),
    share: () => shareMutation.mutate(),
    toggleBookmark: () => bookmarkMutation.mutate(),
  }
}
