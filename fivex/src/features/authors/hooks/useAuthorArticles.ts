import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { articlesApi } from '../api/articles.api'
import type { ArticleStatus, CreateArticleInput } from '../types/authorArticle.types'

const QUERY_KEY = ['articles', 'mine']

/**
 * The signed-in author's own articles, backed by the real /api/articles
 * endpoints (create/list/update-status/delete). React Query handles caching
 * and refetches the list after each mutation.
 */
export function useAuthorArticles() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: articlesApi.listMine,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const createMutation = useMutation({
    mutationFn: (input: CreateArticleInput) => articlesApi.create(input),
    onSuccess: invalidate,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ArticleStatus }) =>
      articlesApi.updateStatus(id, status),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => articlesApi.remove(id),
    onSuccess: invalidate,
  })

  return {
    articles: data ?? [],
    isLoading,
    error,
    createArticle: (input: CreateArticleInput) => createMutation.mutateAsync(input),
    updateStatus: (id: string, status: ArticleStatus) =>
      updateStatusMutation.mutateAsync({ id, status }),
    deleteArticle: (id: string) => deleteMutation.mutateAsync(id),
  }
}

