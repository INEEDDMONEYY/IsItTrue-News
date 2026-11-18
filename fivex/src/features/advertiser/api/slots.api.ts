import { apiClient } from '@/api/client'
import type { AdSlotAvailability } from '../types/advertiser.types'

export const slotsApi = {
  get: async (): Promise<AdSlotAvailability[]> => {
    const { data } = await apiClient.get<{ slots: AdSlotAvailability[] }>('/api/advertiser/slots')
    return data.slots
  },
}
