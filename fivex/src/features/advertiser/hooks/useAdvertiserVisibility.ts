import { useQuery } from '@tanstack/react-query'
import { advertiserApi } from '../api/advertiser.api'
import { ADVERTISER_QUERY_KEY } from './useAdvertiserOverview'

export function useAdvertiserVisibility() {
  return useQuery({ queryKey: [...ADVERTISER_QUERY_KEY, 'visibility'], queryFn: advertiserApi.getVisibility })
}
