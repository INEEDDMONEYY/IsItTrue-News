import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { investigationWorkspaceApi } from '../api/investigations.api'
import type {
  AddTimelineEntryInput,
  UpdateInvestigationInput,
  WorkspaceInvestigation,
} from '@/features/investigations/types/investigation.types'

/**
 * A single investigation's full workspace view (author/collaborator/
 * editor/admin only) plus every mutation available from the workspace:
 * edit content, submit for review, publish/reject (editor/admin), manage
 * the internal timeline, and add internal editorial comments.
 */
export function useInvestigationDetail(id: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = ['investigations', 'detail', id]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => investigationWorkspaceApi.getById(id!),
    enabled: Boolean(id),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  const updateMutation = useMutation({
    mutationFn: (input: UpdateInvestigationInput) => investigationWorkspaceApi.update(id!, input),
    onSuccess: invalidate,
  })

  const submitMutation = useMutation({
    mutationFn: () => investigationWorkspaceApi.submitForReview(id!),
    onSuccess: invalidate,
  })

  const publishMutation = useMutation({
    mutationFn: () => investigationWorkspaceApi.publish(id!),
    onSuccess: invalidate,
  })

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => investigationWorkspaceApi.reject(id!, reason),
    onSuccess: invalidate,
  })

  const addTimelineEntryMutation = useMutation({
    mutationFn: (input: AddTimelineEntryInput) => investigationWorkspaceApi.addTimelineEntry(id!, input),
    onSuccess: invalidate,
  })

  const removeTimelineEntryMutation = useMutation({
    mutationFn: (entryId: string) => investigationWorkspaceApi.removeTimelineEntry(id!, entryId),
    onSuccess: invalidate,
  })

  const addEditorCommentMutation = useMutation({
    mutationFn: (message: string) => investigationWorkspaceApi.addEditorComment(id!, message),
    onSuccess: invalidate,
  })

  return {
    investigation: data?.investigation as WorkspaceInvestigation | undefined,
    isLoading,
    error,
    updateInvestigation: (input: UpdateInvestigationInput) => updateMutation.mutateAsync(input),
    isUpdating: updateMutation.isPending,
    submitForReview: () => submitMutation.mutateAsync(),
    isSubmitting: submitMutation.isPending,
    publish: () => publishMutation.mutateAsync(),
    reject: (reason: string) => rejectMutation.mutateAsync(reason),
    addTimelineEntry: (input: AddTimelineEntryInput) => addTimelineEntryMutation.mutateAsync(input),
    isAddingTimelineEntry: addTimelineEntryMutation.isPending,
    removeTimelineEntry: (entryId: string) => removeTimelineEntryMutation.mutateAsync(entryId),
    addEditorComment: (message: string) => addEditorCommentMutation.mutateAsync(message),
    isAddingEditorComment: addEditorCommentMutation.isPending,
  }
}
