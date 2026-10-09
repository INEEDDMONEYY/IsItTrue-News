import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { articlesApi } from '../api/articles.api'

export const DRAFTS_QUERY_KEY = ['authors', 'articles', 'drafts'] as const

// The author's own articles from the backend, plus the actions available on each draft.
export function useMyDrafts() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: DRAFTS_QUERY_KEY })

  const query = useQuery({
    queryKey: DRAFTS_QUERY_KEY,
    queryFn: articlesApi.listMyArticles,
  })

  const toggleRequirement = useMutation({
    mutationFn: ({ id, requirementId, done }: { id: string; requirementId: string; done: boolean }) =>
      articlesApi.setRequirementDone(id, requirementId, done),
    onSuccess: refresh,
  })

  const submitForReview = useMutation({
    mutationFn: (id: string) => articlesApi.updateStatus(id, 'pending_review'),
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: (id: string) => articlesApi.remove(id),
    onSuccess: refresh,
  })

  return {
    articles: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    toggleRequirement,
    submitForReview,
    remove,
  }
}
