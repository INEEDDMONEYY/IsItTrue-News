import { useQuery } from '@tanstack/react-query'
import { dashboardNavApi } from '../api/dashboardNav.api'

export const DASHBOARD_NAV_COUNTS_KEY = ['dashboard', 'nav-counts'] as const

// Keyed by sidebar path. Polled so badges stay current without a manual refresh.
export function useDashboardNavCounts(): Record<string, number> {
  const { data } = useQuery({
    queryKey: DASHBOARD_NAV_COUNTS_KEY,
    queryFn: dashboardNavApi.getCounts,
    refetchInterval: 60_000,
  })
  return data ?? {}
}
