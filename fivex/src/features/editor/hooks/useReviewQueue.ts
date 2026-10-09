import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewQueueApi } from '../api/reviewQueue.api'

export const PENDING_KEY = ['editor', 'pending-articles'] as const
export const CHANGES_REQUESTED_KEY = ['editor', 'changes-requested-articles'] as const

// Articles awaiting an editorial decision, plus the approve / request-changes actions.
export function useReviewQueue() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: PENDING_KEY,
    queryFn: reviewQueueApi.listPending,
    // New submissions arrive while the editor has the page open.
    refetchInterval: 60_000,
  })

  const onDecision = () => {
    queryClient.invalidateQueries({ queryKey: PENDING_KEY })
    queryClient.invalidateQueries({ queryKey: CHANGES_REQUESTED_KEY })
    queryClient.invalidateQueries({ queryKey: ['articles'] })
  }

  const approveMutation = useMutation({
    mutationFn: (id: string) => reviewQueueApi.approve(id),
    onSuccess: onDecision,
  })

  const requestChangesMutation = useMutation({
    mutationFn: ({ id, requirements, note }: { id: string; requirements: string[]; note?: string }) =>
      reviewQueueApi.requestChanges(id, { requirements, note }),
    onSuccess: onDecision,
  })

  return {
    articles: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    approve: approveMutation.mutateAsync,
    requestChanges: requestChangesMutation.mutateAsync,
  }
}

// Drafts the editor sent back that the author hasn't resubmitted yet.
export function useChangesRequested() {
  const query = useQuery({
    queryKey: CHANGES_REQUESTED_KEY,
    queryFn: reviewQueueApi.listChangesRequested,
    refetchInterval: 60_000,
  })

  return {
    articles: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
