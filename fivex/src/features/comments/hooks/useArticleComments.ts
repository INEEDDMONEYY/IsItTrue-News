import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '../api/comments.api'

/**
 * Live comments for a single (real, backend-sourced) article. Not used for
 * mock articles, which keep their own local-only comment state.
 */
export function useArticleComments(articleId: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = ['comments', 'article', articleId]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => commentsApi.listByArticle(articleId!),
    enabled: Boolean(articleId),
  })

  const createMutation = useMutation({
    mutationFn: (content: string) => commentsApi.create(articleId!, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const toggleLikeMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.toggleLike(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    comments: data?.comments ?? [],
    likedCommentIds: data?.likedCommentIds ?? [],
    isLoading,
    postComment: createMutation.mutateAsync,
    isPosting: createMutation.isPending,
    toggleCommentLike: toggleLikeMutation.mutate,
  }
}
