import { apiClient } from '@/api/client'
import type { FactCheckRequest } from '@/features/authors/types/factCheckRequest.types'

/**
 * Admin review side of the fact-check system, backed by /api/fact-checks.
 * Only admins can list pending/all requests and approve/reject them.
 */
export const factCheckVerificationApi = {
  listPending: async (): Promise<FactCheckRequest[]> => {
    const { data } = await apiClient.get<{ factChecks: FactCheckRequest[] }>('/api/fact-checks/pending')
    return data.factChecks
  },

  listAll: async (): Promise<FactCheckRequest[]> => {
    const { data } = await apiClient.get<{ factChecks: FactCheckRequest[] }>('/api/fact-checks/all')
    return data.factChecks
  },

  approve: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/fact-checks/${id}/approve`)
  },

  reject: async (id: string, reason: string): Promise<void> => {
    await apiClient.patch(`/api/fact-checks/${id}/reject`, { reason })
  },
}
