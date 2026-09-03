import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { investigationsApi } from '../api/investigations.api'

/**
 * Public, reader-facing view of a single investigation, backed by the real
 * GET /api/investigations/:id endpoint. The backend decides — based on the
 * caller's role/relationship to the investigation — whether to hand back
 * the full workspace doc or the sanitized, access-tier-gated public view;
 * this hook just surfaces whatever it gets.
 */
export function useInvestigation(id: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = ['investigations', 'detail', id]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => investigationsApi.getById(id!),
    enabled: Boolean(id),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  const commentMutation = useMutation({
    mutationFn: (content: string) => investigationsApi.addComment(id!, content),
    onSuccess: invalidate,
  })

  const bookmarkMutation = useMutation({
    mutationFn: () => investigationsApi.toggleBookmark(id!),
    onSuccess: invalidate,
  })

  const followMutation = useMutation({
    mutationFn: () => investigationsApi.toggleFollow(id!),
    onSuccess: invalidate,
  })

  return {
    investigation: data?.investigation,
    workspace: data?.workspace ?? false,
    access: data?.access,
    isLoading,
    error,
    addComment: (content: string) => commentMutation.mutateAsync(content),
    isPostingComment: commentMutation.isPending,
    toggleBookmark: () => bookmarkMutation.mutate(),
    toggleFollow: () => followMutation.mutate(),
  }
}
