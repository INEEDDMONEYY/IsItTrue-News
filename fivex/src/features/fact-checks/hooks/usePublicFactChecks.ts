import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { publicFactChecksApi } from '../api/publicFactChecks.api'
import type { PublicFactCheckListParams } from '../types/publicFactCheck.types'

export function usePublicFactChecks(params: PublicFactCheckListParams) {
  return useQuery({
    queryKey: ['fact-checks', 'list', params],
    queryFn: () => publicFactChecksApi.list(params),
    // Keeps the current cards on screen while the next filter or page loads.
    placeholderData: keepPreviousData,
  })
}

export function usePublicFactCheck(id: string) {
  return useQuery({
    queryKey: ['fact-checks', 'detail', id],
    queryFn: () => publicFactChecksApi.get(id),
    enabled: Boolean(id),
    retry: false,
  })
}

// Real stories only: mock stories have no backend record, so there is nothing to ask for.
export function useArticleFactCheck(slug: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['fact-checks', 'article', slug],
    queryFn: () => publicFactChecksApi.forArticle(slug!),
    enabled: enabled && Boolean(slug),
    retry: false,
  })
}
