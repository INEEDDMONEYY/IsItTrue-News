import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campaignsApi } from '../api/campaigns.api'
import type { BundleInput, CampaignEditInput, CampaignStatus } from '../types/advertiser.types'
import { ADVERTISER_QUERY_KEY } from './useAdvertiserOverview'

const CAMPAIGNS_KEY = [...ADVERTISER_QUERY_KEY, 'campaigns'] as const
const PRICING_KEY = [...ADVERTISER_QUERY_KEY, 'pricing'] as const

// Prices change rarely, so the catalog is cached for the session.
export function usePricing() {
  return useQuery({
    queryKey: PRICING_KEY,
    queryFn: campaignsApi.pricing,
    staleTime: Infinity,
  })
}

export function useCampaigns(filter: { status?: CampaignStatus; q?: string }) {
  return useQuery({
    queryKey: [...CAMPAIGNS_KEY, 'list', filter.status ?? 'all', filter.q ?? ''],
    queryFn: () => campaignsApi.list(filter),
    placeholderData: keepPreviousData,
  })
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: [...CAMPAIGNS_KEY, 'detail', id],
    queryFn: () => campaignsApi.get(id as string),
    enabled: Boolean(id),
  })
}

// Overview, analytics, billing and library usage are all derived from campaigns, so any change refreshes them.
function useInvalidateAdvertiser() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ADVERTISER_QUERY_KEY })
}

export function useUpdateCampaign(id: string | undefined) {
  const invalidate = useInvalidateAdvertiser()
  return useMutation({
    // The form only saves through this hook when editing an existing campaign.
    mutationFn: (input: CampaignEditInput) => campaignsApi.update(id as string, input),
    onSuccess: invalidate,
  })
}

export function useCreateBundle() {
  const invalidate = useInvalidateAdvertiser()
  return useMutation({
    mutationFn: (input: BundleInput) => campaignsApi.createBundle(input),
    onSuccess: invalidate,
  })
}

export function useCampaignActions() {
  const invalidate = useInvalidateAdvertiser()
  const pause = useMutation({ mutationFn: campaignsApi.pause, onSuccess: invalidate })
  const resume = useMutation({ mutationFn: campaignsApi.resume, onSuccess: invalidate })
  const remove = useMutation({ mutationFn: campaignsApi.remove, onSuccess: invalidate })
  return { pause, resume, remove }
}
