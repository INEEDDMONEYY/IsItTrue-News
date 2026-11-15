import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { advertisementApi, type CampaignFilter } from '../api/advertisement.api'
import type { AdvertiserStatus } from '../types/advertisement.types'

const ROOT_KEY = ['advertisement'] as const

/** Campaign approval and advertiser status changes affect every summary, so all admin advertisement data is refreshed. */
export function useAdvertisementOverview() {
  return useQuery({ queryKey: [...ROOT_KEY, 'overview'], queryFn: advertisementApi.overview })
}

export function useAdvertisers(status?: AdvertiserStatus) {
  return useQuery({
    queryKey: [...ROOT_KEY, 'advertisers', status ?? 'all'],
    queryFn: () => advertisementApi.listAdvertisers(status),
  })
}

export function useAdvertiserStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdvertiserStatus }) =>
      advertisementApi.setAdvertiserStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROOT_KEY }),
  })
}

export function useCampaigns(filter: CampaignFilter = {}) {
  return useQuery({
    queryKey: [...ROOT_KEY, 'campaigns', filter.status ?? 'all', filter.placement ?? 'all'],
    queryFn: () => advertisementApi.listCampaigns(filter),
  })
}

export function useApprovals() {
  return useQuery({ queryKey: [...ROOT_KEY, 'approvals'], queryFn: advertisementApi.listApprovals })
}

export function useCampaignReviewMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ROOT_KEY })

  const approve = useMutation({
    mutationFn: (id: string) => advertisementApi.approveCampaign(id),
    onSuccess: invalidate,
  })

  const reject = useMutation({
    mutationFn: ({ id, reviewNote }: { id: string; reviewNote: string }) =>
      advertisementApi.rejectCampaign(id, reviewNote),
    onSuccess: invalidate,
  })

  return { approve, reject }
}

export function usePlacements() {
  return useQuery({ queryKey: [...ROOT_KEY, 'placements'], queryFn: advertisementApi.listPlacements })
}

export function useScheduling() {
  return useQuery({ queryKey: [...ROOT_KEY, 'scheduling'], queryFn: advertisementApi.listScheduling })
}

export function useAdvertisementAnalytics() {
  return useQuery({ queryKey: [...ROOT_KEY, 'analytics'], queryFn: advertisementApi.analytics })
}

export function useAdvertisementSettings() {
  return useQuery({ queryKey: [...ROOT_KEY, 'settings'], queryFn: advertisementApi.settings })
}
