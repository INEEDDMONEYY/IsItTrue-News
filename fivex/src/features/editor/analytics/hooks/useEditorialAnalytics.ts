import { useQuery } from '@tanstack/react-query'
import { editorialAnalyticsApi } from '../api/editorialAnalytics.api'
import type { EditorialAnalyticsQuery } from '../types/editorialAnalytics.types'

export const EDITORIAL_ANALYTICS_KEY = ['editor', 'editorial-analytics'] as const

// Analytics are reporting data, so a 5-minute refetch is enough and a stale result is flagged in the UI.
const REFRESH_INTERVAL_MS = 5 * 60_000

export function useEditorialOverview(query: EditorialAnalyticsQuery) {
  return useQuery({
    queryKey: [...EDITORIAL_ANALYTICS_KEY, 'overview', query],
    queryFn: () => editorialAnalyticsApi.getOverview(query),
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

export function useAuthorPerformance(query: EditorialAnalyticsQuery) {
  return useQuery({
    queryKey: [...EDITORIAL_ANALYTICS_KEY, 'authors', query],
    queryFn: () => editorialAnalyticsApi.getAuthorPerformance(query),
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

export function useContentQuality(query: EditorialAnalyticsQuery) {
  return useQuery({
    queryKey: [...EDITORIAL_ANALYTICS_KEY, 'content-quality', query],
    queryFn: () => editorialAnalyticsApi.getContentQuality(query),
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

export function useWorkflow(query: EditorialAnalyticsQuery) {
  return useQuery({
    queryKey: [...EDITORIAL_ANALYTICS_KEY, 'workflow', query],
    queryFn: () => editorialAnalyticsApi.getWorkflow(query),
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

export function useFactChecks(query: EditorialAnalyticsQuery) {
  return useQuery({
    queryKey: [...EDITORIAL_ANALYTICS_KEY, 'fact-checks', query],
    queryFn: () => editorialAnalyticsApi.getFactChecks(query),
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

export function useInvestigations(query: EditorialAnalyticsQuery) {
  return useQuery({
    queryKey: [...EDITORIAL_ANALYTICS_KEY, 'investigations', query],
    queryFn: () => editorialAnalyticsApi.getInvestigations(query),
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

export function useArticlePerformance(query: EditorialAnalyticsQuery) {
  return useQuery({
    queryKey: [...EDITORIAL_ANALYTICS_KEY, 'article-performance', query],
    queryFn: () => editorialAnalyticsApi.getArticlePerformance(query),
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
