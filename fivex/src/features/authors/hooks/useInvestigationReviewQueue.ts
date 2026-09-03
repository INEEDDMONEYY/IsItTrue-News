import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { investigationWorkspaceApi } from '../api/investigations.api'

const QUERY_KEY = ['investigations', 'review-queue']

/**
 * Editor/admin verification queue — investigations pending a publish
 * decision. Backed by GET /api/investigations/review-queue.
 */
export function useInvestigationReviewQueue() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: investigationWorkspaceApi.listReviewQueue,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const publishMutation = useMutation({
    mutationFn: (id: string) => investigationWorkspaceApi.publish(id),
    onSuccess: invalidate,
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => investigationWorkspaceApi.reject(id, reason),
    onSuccess: invalidate,
  })

  return {
    investigations: data ?? [],
    isLoading,
    error,
    publish: (id: string) => publishMutation.mutateAsync(id),
    reject: (id: string, reason: string) => rejectMutation.mutateAsync({ id, reason }),
  }
}
