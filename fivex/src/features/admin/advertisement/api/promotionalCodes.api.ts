import { apiClient } from '@/api/client'
import type { PromotionalCode, PromotionalCodeRecord } from '../utils/promotionalCodes'

// Matches the admin routes mounted at /api/admin/promotional-codes.
const BASE = '/api/admin/promotional-codes'

export const promotionalCodesApi = {
  list: async (): Promise<PromotionalCode[]> => {
    const { data } = await apiClient.get<{ codes: PromotionalCode[] }>(BASE)
    return data.codes
  },

  create: async (input: PromotionalCodeRecord): Promise<PromotionalCode> => {
    const { data } = await apiClient.post<{ code: PromotionalCode }>(BASE, input)
    return data.code
  },

  update: async (id: string, input: PromotionalCodeRecord): Promise<PromotionalCode> => {
    const { data } = await apiClient.put<{ code: PromotionalCode }>(`${BASE}/${id}`, input)
    return data.code
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
