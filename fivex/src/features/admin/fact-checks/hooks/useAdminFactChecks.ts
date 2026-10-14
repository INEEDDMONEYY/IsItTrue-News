import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { factChecksApi } from '../api/factChecks.api'
import type { FactCheckListParams, FactCheckRecord } from '../types/factCheck.types'

export const FACT_CHECKS_KEY = ['admin', 'fact-checks'] as const

export function useFactCheckOverview() {
  return useQuery({
    queryKey: [...FACT_CHECKS_KEY, 'overview'],
    queryFn: factChecksApi.overview,
    // Reviewers keep working while an admin has the page open.
    refetchInterval: 60_000,
  })
}

export function useFactChecks(params: FactCheckListParams) {
  return useQuery({
    queryKey: [...FACT_CHECKS_KEY, 'list', params],
    queryFn: () => factChecksApi.list(params),
    // Keeps the current rows on screen while the next page or filter loads.
    placeholderData: keepPreviousData,
  })
}

export function useFactCheckRecord(id: string) {
  return useQuery({
    queryKey: [...FACT_CHECKS_KEY, 'detail', id],
    queryFn: () => factChecksApi.get(id),
    enabled: Boolean(id),
    retry: false,
  })
}

export function useFactCheckHistory(id: string) {
  return useQuery({
    queryKey: [...FACT_CHECKS_KEY, 'history', id],
    queryFn: () => factChecksApi.history(id),
    enabled: Boolean(id),
  })
}

export function useReviewers(enabled = true) {
  return useQuery({
    queryKey: [...FACT_CHECKS_KEY, 'reviewers'],
    queryFn: factChecksApi.reviewers,
    staleTime: 5 * 60_000,
    enabled,
  })
}

export function useInvestigationOptions(enabled: boolean) {
  return useQuery({
    queryKey: [...FACT_CHECKS_KEY, 'investigations'],
    queryFn: factChecksApi.investigations,
    enabled,
  })
}

// Runs any of the admin actions. The overview, the list, the record and its history all change with an
// action, so every fact-check query is refreshed, and the record is shown as the server returned it.
export function useFactCheckAction(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (run: () => Promise<FactCheckRecord>) => run(),
    onSuccess: (record) => {
      queryClient.setQueryData([...FACT_CHECKS_KEY, 'detail', id], record)
      return queryClient.invalidateQueries({ queryKey: FACT_CHECKS_KEY })
    },
  })
}
