import { apiClient } from '@/api/client'
import type {
  AdvertisementOverview,
  AdvertisementSettings,
  AdvertiserRow,
  AdvertiserStatus,
  AdvertiserStatusResult,
  AnalyticsSummary,
  CampaignPlacement,
  CampaignRow,
  CampaignStatus,
  PlacementSummary,
} from '../types/advertisement.types'

// Matches the admin routes mounted at /api/admin/advertisement.
const BASE = '/api/admin/advertisement'

export interface CampaignFilter {
  status?: CampaignStatus
  placement?: CampaignPlacement
}

export const advertisementApi = {
  overview: async (): Promise<AdvertisementOverview> => {
    const { data } = await apiClient.get<AdvertisementOverview>(`${BASE}/overview`)
    return data
  },

  listAdvertisers: async (status?: AdvertiserStatus): Promise<AdvertiserRow[]> => {
    const { data } = await apiClient.get<{ advertisers: AdvertiserRow[] }>(`${BASE}/advertisers`, {
      params: status ? { status } : undefined,
    })
    return data.advertisers
  },

  setAdvertiserStatus: async (id: string, status: AdvertiserStatus): Promise<AdvertiserStatusResult> => {
    const { data } = await apiClient.patch<AdvertiserStatusResult>(`${BASE}/advertisers/${id}/status`, { status })
    return data
  },

  listCampaigns: async (filter: CampaignFilter = {}): Promise<CampaignRow[]> => {
    const { data } = await apiClient.get<{ campaigns: CampaignRow[] }>(`${BASE}/campaigns`, { params: filter })
    return data.campaigns
  },

  listApprovals: async (): Promise<CampaignRow[]> => {
    const { data } = await apiClient.get<{ campaigns: CampaignRow[] }>(`${BASE}/approvals`)
    return data.campaigns
  },

  approveCampaign: async (id: string): Promise<void> => {
    await apiClient.post(`${BASE}/campaigns/${id}/approve`)
  },

  rejectCampaign: async (id: string, reviewNote: string): Promise<void> => {
    await apiClient.post(`${BASE}/campaigns/${id}/reject`, { reviewNote })
  },

  listPlacements: async (): Promise<PlacementSummary[]> => {
    const { data } = await apiClient.get<{ placements: PlacementSummary[] }>(`${BASE}/placements`)
    return data.placements
  },

  listScheduling: async (): Promise<CampaignRow[]> => {
    const { data } = await apiClient.get<{ campaigns: CampaignRow[] }>(`${BASE}/scheduling`)
    return data.campaigns
  },

  analytics: async (): Promise<AnalyticsSummary> => {
    const { data } = await apiClient.get<AnalyticsSummary>(`${BASE}/analytics`)
    return data
  },

  settings: async (): Promise<AdvertisementSettings> => {
    const { data } = await apiClient.get<AdvertisementSettings>(`${BASE}/settings`)
    return data
  },
}
