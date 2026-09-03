import { apiClient } from '@/api/client'
import type { CreateEvidenceInput, UpdateEvidenceInput, VaultEvidence } from '@/features/evidence/types/evidence.types'

/**
 * Author/editor/admin-only Evidence Vault endpoints — backed by the real
 * /api/investigations/:investigationId/evidence routes. Strictly private;
 * never returns anything the reader-facing Evidence Viewer would use.
 */
export const evidenceVaultApi = {
  listMyVault: async (): Promise<VaultEvidence[]> => {
    const { data } = await apiClient.get<{ evidence: VaultEvidence[] }>('/api/investigations/evidence/mine')
    return data.evidence
  },

  listForInvestigation: async (investigationId: string): Promise<VaultEvidence[]> => {
    const { data } = await apiClient.get<{ evidence: VaultEvidence[] }>(
      `/api/investigations/${investigationId}/evidence`,
    )
    return data.evidence
  },

  create: async (investigationId: string, input: CreateEvidenceInput): Promise<VaultEvidence> => {
    const { data } = await apiClient.post<{ evidence: VaultEvidence }>(
      `/api/investigations/${investigationId}/evidence`,
      input,
    )
    return data.evidence
  },

  update: async (investigationId: string, evidenceId: string, input: UpdateEvidenceInput): Promise<void> => {
    await apiClient.patch(`/api/investigations/${investigationId}/evidence/${evidenceId}`, input)
  },

  approve: async (investigationId: string, evidenceId: string): Promise<void> => {
    await apiClient.post(`/api/investigations/${investigationId}/evidence/${evidenceId}/approve`)
  },

  revoke: async (investigationId: string, evidenceId: string): Promise<void> => {
    await apiClient.post(`/api/investigations/${investigationId}/evidence/${evidenceId}/revoke`)
  },

  remove: async (investigationId: string, evidenceId: string): Promise<void> => {
    await apiClient.delete(`/api/investigations/${investigationId}/evidence/${evidenceId}`)
  },
}
