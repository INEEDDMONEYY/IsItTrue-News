import { apiClient } from '@/api/client'
import { API_BASE_URL } from '@/config/env'

export type PublicAdPlacement = 'header' | 'footer' | 'sidepage' | 'selected_page' | 'newsletter'

export type PublicAdPage =
  | 'home'
  | 'for_you'
  | 'article'
  | 'fact_checks'
  | 'videos'
  | 'investigations'
  | 'local'
  | 'newsletter'

export interface PublicAd {
  campaignId: string
  placement: PublicAdPlacement
  headline: string
  body: string
  ctaLabel: string
  destinationUrl: string
  imageUrl?: string
}

export interface AdRequest {
  placement: PublicAdPlacement
  page?: PublicAdPage
  category?: string
}

// Public, read-only. The server returns one live campaign, or null when nothing should run in this slot.
export const adsApi = {
  getAd: async ({ placement, page, category }: AdRequest): Promise<PublicAd | null> => {
    const { data } = await apiClient.get<{ ad: PublicAd | null }>('/api/ads', {
      params: { placement, page, category },
    })
    return data.ad
  },

  recordImpression: async (campaignId: string): Promise<void> => {
    await apiClient.post(`/api/ads/${campaignId}/impressions`)
  },
}

// Clicks go through the server so they are counted, then redirect to the advertiser's destination.
export function adClickUrl(campaignId: string): string {
  return `${API_BASE_URL}/api/ads/${campaignId}/click`
}
