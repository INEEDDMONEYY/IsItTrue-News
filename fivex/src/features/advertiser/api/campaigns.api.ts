import { apiClient } from '@/api/client'
import type { AdvertiserOverview } from '../types/advertiser.types'

export const campaignsApi = {
  getOverview: async (): Promise<AdvertiserOverview> => {
    const { data } = await apiClient.get<AdvertiserOverview>('/api/advertiser/overview')
    return data
  },
}
