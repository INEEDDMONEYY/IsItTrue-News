import { useQuery } from '@tanstack/react-query'
import { evidenceVaultApi } from '../api/evidenceVault.api'

/**
 * The global Evidence Vault across every investigation the signed-in
 * author/editor/admin can manage — feeds the standalone "Evidence Vault"
 * workspace page (editor/admin see every investigation's vault).
 */
export function useMyEvidenceVault() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['investigations', 'evidence', 'mine'],
    queryFn: evidenceVaultApi.listMyVault,
  })

  return {
    evidence: data ?? [],
    isLoading,
    error,
  }
}
