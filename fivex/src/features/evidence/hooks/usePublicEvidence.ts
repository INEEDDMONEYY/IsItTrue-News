import { useQuery } from '@tanstack/react-query'
import { publicEvidenceApi } from '../api/publicEvidence.api'

export function usePublicEvidence(investigationId: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['investigations', investigationId, 'evidence', 'public'],
    queryFn: () => publicEvidenceApi.listForInvestigation(investigationId!),
    enabled: Boolean(investigationId),
  })

  return {
    evidence: data ?? [],
    isLoading,
    error,
  }
}
