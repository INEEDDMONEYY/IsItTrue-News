import { apiClient } from '@/api/client'
import type { PublicEvidenceItem } from '../types/evidence.types'

/**
 * Public, reader-facing evidence endpoint — backed by the real
 * GET /api/investigations/:investigationId/evidence/public route. Only
 * approved document/photo/video evidence on a published investigation is
 * ever returned here; the private vault is a completely separate,
 * authenticated API.
 */
export const publicEvidenceApi = {
  listForInvestigation: async (investigationId: string): Promise<PublicEvidenceItem[]> => {
    const { data } = await apiClient.get<{ evidence: PublicEvidenceItem[] }>(
      `/api/investigations/${investigationId}/evidence/public`,
    )
    return data.evidence
  },
}
