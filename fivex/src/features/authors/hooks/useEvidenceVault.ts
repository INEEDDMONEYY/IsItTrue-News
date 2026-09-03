import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { evidenceVaultApi } from '../api/evidenceVault.api'
import type { CreateEvidenceInput } from '@/features/evidence/types/evidence.types'

/**
 * The private Evidence Vault for one investigation (author/collaborator/
 * editor/admin only) — upload, edit, delete, and (editor/admin) approve or
 * revoke public release.
 */
export function useEvidenceVault(investigationId: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = ['investigations', investigationId, 'evidence', 'vault']

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => evidenceVaultApi.listForInvestigation(investigationId!),
    enabled: Boolean(investigationId),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  const createMutation = useMutation({
    mutationFn: (input: CreateEvidenceInput) => evidenceVaultApi.create(investigationId!, input),
    onSuccess: invalidate,
  })

  const approveMutation = useMutation({
    mutationFn: (evidenceId: string) => evidenceVaultApi.approve(investigationId!, evidenceId),
    onSuccess: invalidate,
  })

  const revokeMutation = useMutation({
    mutationFn: (evidenceId: string) => evidenceVaultApi.revoke(investigationId!, evidenceId),
    onSuccess: invalidate,
  })

  const removeMutation = useMutation({
    mutationFn: (evidenceId: string) => evidenceVaultApi.remove(investigationId!, evidenceId),
    onSuccess: invalidate,
  })

  return {
    evidence: data ?? [],
    isLoading,
    error,
    uploadEvidence: (input: CreateEvidenceInput) => createMutation.mutateAsync(input),
    isUploading: createMutation.isPending,
    approveEvidence: (evidenceId: string) => approveMutation.mutateAsync(evidenceId),
    revokeEvidence: (evidenceId: string) => revokeMutation.mutateAsync(evidenceId),
    removeEvidence: (evidenceId: string) => removeMutation.mutateAsync(evidenceId),
  }
}
