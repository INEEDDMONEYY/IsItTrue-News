import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { factCheckVerificationApi } from '../api/factCheckVerification.api'

const QUERY_KEY = ['fact-checks', 'admin']

/**
 * Admin fact-check review queue, backed by the real /api/fact-checks
 * endpoints. Approving/rejecting also updates the underlying article's
 * fact-check status, which is what drives the reader-facing indicator.
 */
export function useFactCheckVerification() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: factCheckVerificationApi.listPending,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const approveMutation = useMutation({
    mutationFn: (id: string) => factCheckVerificationApi.approve(id),
    onSuccess: invalidate,
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      factCheckVerificationApi.reject(id, reason),
    onSuccess: invalidate,
  })

  return {
    requests: data ?? [],
    isLoading,
    error,
    approveRequest: (id: string) => approveMutation.mutateAsync(id),
    rejectRequest: (id: string, reason: string) => rejectMutation.mutateAsync({ id, reason }),
  }
}
