import { useQuery } from '@tanstack/react-query'
import { campaignsApi } from '../api/campaigns.api'
import { ADVERTISER_QUERY_KEY } from './useAdvertiserOverview'

export function useAdvertiserNavCounts(): Record<string, number> {
  const { data } = useQuery({
    queryKey: [...ADVERTISER_QUERY_KEY, 'nav-counts'],
    queryFn: campaignsApi.getNavCounts,
    refetchInterval: 60_000,
  })
  return data ?? {}
}
