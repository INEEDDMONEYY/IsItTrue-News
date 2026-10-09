import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/analytics.api'

export const ADMIN_ANALYTICS_KEY = ['admin', 'analytics', 'overview'] as const

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ADMIN_ANALYTICS_KEY,
    queryFn: analyticsApi.getOverview,
    // New signups arrive while an admin has the page open.
    refetchInterval: 60_000,
  })
}
