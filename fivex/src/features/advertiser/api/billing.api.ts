import { apiClient } from '@/api/client'
import type { AdvertiserBilling } from '../types/advertiser.types'

export const billingApi = {
  get: async (): Promise<AdvertiserBilling> => {
    const { data } = await apiClient.get<AdvertiserBilling>('/api/advertiser/billing')
    return data
  },
}
