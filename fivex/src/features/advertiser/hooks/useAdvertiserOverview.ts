import { useQuery } from '@tanstack/react-query'
import { campaignsApi } from '../api/campaigns.api'

// Everything cached for the signed-in advertiser lives under this key, so it can be cleared in one go.
export const ADVERTISER_QUERY_KEY = ['advertiser'] as const

export function useAdvertiserOverview() {
  return useQuery({
    queryKey: [...ADVERTISER_QUERY_KEY, 'overview'],
    queryFn: campaignsApi.getOverview,
  })
}
