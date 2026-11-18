import { apiClient } from '@/api/client'
import type {
  AdvertiserAnalytics,
  AdvertiserCampaign,
  AdvertiserOverview,
  BundleInput,
  CampaignEditInput,
  CampaignStatus,
  PricingCatalog,
} from '../types/advertiser.types'

const BASE = '/api/advertiser'

export const campaignsApi = {
  getOverview: async (): Promise<AdvertiserOverview> => {
    const { data } = await apiClient.get<AdvertiserOverview>(`${BASE}/overview`)
    return data
  },

  getNavCounts: async (): Promise<Record<string, number>> => {
    const { data } = await apiClient.get<{ counts: Record<string, number> }>(`${BASE}/nav-counts`)
    return data.counts
  },

  list: async (filter: { status?: CampaignStatus; q?: string } = {}): Promise<AdvertiserCampaign[]> => {
    const { data } = await apiClient.get<{ campaigns: AdvertiserCampaign[] }>(`${BASE}/campaigns`, {
      params: { status: filter.status || undefined, q: filter.q || undefined },
    })
    return data.campaigns
  },

  pricing: async (): Promise<PricingCatalog> => {
    const { data } = await apiClient.get<PricingCatalog>(`${BASE}/pricing`)
    return data
  },

  createBundle: async (input: BundleInput): Promise<AdvertiserCampaign[]> => {
    const { data } = await apiClient.post<{ campaigns: AdvertiserCampaign[] }>(`${BASE}/campaigns/bundle`, input)
    return data.campaigns
  },

  get: async (id: string): Promise<AdvertiserCampaign> => {
    const { data } = await apiClient.get<{ campaign: AdvertiserCampaign }>(`${BASE}/campaigns/${encodeURIComponent(id)}`)
    return data.campaign
  },

  update: async (id: string, input: CampaignEditInput): Promise<AdvertiserCampaign> => {
    const { data } = await apiClient.put<{ campaign: AdvertiserCampaign }>(
      `${BASE}/campaigns/${encodeURIComponent(id)}`,
      input,
    )
    return data.campaign
  },

  pause: async (id: string): Promise<AdvertiserCampaign> => {
    const { data } = await apiClient.post<{ campaign: AdvertiserCampaign }>(
      `${BASE}/campaigns/${encodeURIComponent(id)}/pause`,
    )
    return data.campaign
  },

  resume: async (id: string): Promise<AdvertiserCampaign> => {
    const { data } = await apiClient.post<{ campaign: AdvertiserCampaign }>(
      `${BASE}/campaigns/${encodeURIComponent(id)}/resume`,
    )
    return data.campaign
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/campaigns/${encodeURIComponent(id)}`)
  },

  analytics: async (): Promise<AdvertiserAnalytics> => {
    const { data } = await apiClient.get<AdvertiserAnalytics>(`${BASE}/analytics`)
    return data
  },
}
