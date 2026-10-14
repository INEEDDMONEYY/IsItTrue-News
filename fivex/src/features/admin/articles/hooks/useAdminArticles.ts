import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminArticlesApi } from '../api/articles.api'
import type { AdminArticleListParams, ChangeStatusInput } from '../types/adminArticle.types'

export const ADMIN_ARTICLES_KEY = ['admin', 'articles'] as const

export function useAdminArticles(params: AdminArticleListParams) {
  return useQuery({
    queryKey: [...ADMIN_ARTICLES_KEY, 'list', params],
    queryFn: () => adminArticlesApi.list(params),
    // Keeps the current rows on screen while the next page or filter loads.
    placeholderData: keepPreviousData,
  })
}

export function useAdminArticle(id: string) {
  return useQuery({
    queryKey: [...ADMIN_ARTICLES_KEY, 'detail', id],
    queryFn: () => adminArticlesApi.get(id),
    enabled: Boolean(id),
    retry: false,
  })
}

export function useAdminArticleAudit(id: string) {
  return useQuery({
    queryKey: [...ADMIN_ARTICLES_KEY, 'audit', id],
    queryFn: () => adminArticlesApi.audit(id),
    enabled: Boolean(id),
  })
}

export function useChangeArticleStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ChangeStatusInput) => adminArticlesApi.changeStatus(id, input),
    // The list, the detail and the history all change with a status, so refresh every admin article query.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_ARTICLES_KEY }),
  })
}

export function useDeleteAdminArticle(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => adminArticlesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_ARTICLES_KEY, refetchType: 'none' }),
  })
}
