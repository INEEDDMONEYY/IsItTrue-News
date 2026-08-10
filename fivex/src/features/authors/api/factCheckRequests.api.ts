import { apiClient } from '@/api/client'
import type { CreateFactCheckRequestInput, FactCheckRequest } from '../types/factCheckRequest.types'

/**
 * Fact-check requests, submitted by an author/editor for one of their own
 * articles and reviewed by the admin "IsItTrue Fact-Check Team". Backed by
 * /api/fact-checks (authors + editors submit and view their own; admins
 * review via the separate admin fact-check-verification API).
 */
export const factCheckRequestsApi = {
  listMine: async (): Promise<FactCheckRequest[]> => {
    const { data } = await apiClient.get<{ factChecks: FactCheckRequest[] }>('/api/fact-checks/mine')
    return data.factChecks
  },

  create: async (input: CreateFactCheckRequestInput): Promise<FactCheckRequest> => {
    const { data } = await apiClient.post<{ factCheck: FactCheckRequest }>('/api/fact-checks', input)
    return data.factCheck
  },
}
