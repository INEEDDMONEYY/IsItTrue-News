import { useQuery } from '@tanstack/react-query'
import { billingApi } from '../api/billing.api'
import { campaignsApi } from '../api/campaigns.api'
import { ADVERTISER_QUERY_KEY } from './useAdvertiserOverview'

export function useAdvertiserAnalytics() {
  return useQuery({ queryKey: [...ADVERTISER_QUERY_KEY, 'analytics'], queryFn: campaignsApi.analytics })
}

export function useAdvertiserBilling() {
  return useQuery({ queryKey: [...ADVERTISER_QUERY_KEY, 'billing'], queryFn: billingApi.get })
}
