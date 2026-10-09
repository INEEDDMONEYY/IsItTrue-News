import { apiClient } from '@/api/client'
import type {
  Correction,
  CorrectionCounts,
  CorrectionStatus,
  CreateCorrectionInput,
  InvestigationVerdict,
} from '../types/correction.types'

export const correctionsApi = {
  list: async (status: CorrectionStatus): Promise<{ corrections: Correction[]; counts: CorrectionCounts }> => {
    const { data } = await apiClient.get<{ corrections: Correction[]; counts: CorrectionCounts }>('/api/corrections', {
      params: { status },
    })
    return data
  },

  create: async (input: CreateCorrectionInput): Promise<Correction> => {
    const { data } = await apiClient.post<{ correction: Correction }>('/api/corrections', input)
    return data.correction
  },

  startInvestigation: async (id: string): Promise<Correction> => {
    const { data } = await apiClient.post<{ correction: Correction }>(`/api/corrections/${id}/investigate`)
    return data.correction
  },

  recordFindings: async (
    id: string,
    input: { findings: string; verdict: InvestigationVerdict },
  ): Promise<Correction> => {
    const { data } = await apiClient.patch<{ correction: Correction }>(`/api/corrections/${id}/findings`, input)
    return data.correction
  },

  publish: async (id: string, text: string): Promise<Correction> => {
    const { data } = await apiClient.post<{ correction: Correction }>(`/api/corrections/${id}/publish`, { text })
    return data.correction
  },

  dismiss: async (id: string, reason: string): Promise<Correction> => {
    const { data } = await apiClient.post<{ correction: Correction }>(`/api/corrections/${id}/dismiss`, { reason })
    return data.correction
  },
}
