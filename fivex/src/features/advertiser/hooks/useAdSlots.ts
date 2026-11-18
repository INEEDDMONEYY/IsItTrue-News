import { useQuery } from '@tanstack/react-query'
import { slotsApi } from '../api/slots.api'
import { ADVERTISER_QUERY_KEY } from './useAdvertiserOverview'

export function useAdSlots() {
  return useQuery({ queryKey: [...ADVERTISER_QUERY_KEY, 'slots'], queryFn: slotsApi.get })
}
