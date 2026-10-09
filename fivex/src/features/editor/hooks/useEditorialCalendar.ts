import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { editorialCalendarService } from '../services/calendar.service'
import type { EditorialWorkflowUpdate } from '../types/calendar.types'

export const EDITORIAL_CALENDAR_KEY = ['editor', 'editorial-calendar'] as const

export function useEditorialCalendar() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: EDITORIAL_CALENDAR_KEY,
    queryFn: editorialCalendarService.listWorkflowItems,
    refetchInterval: 60_000,
  })

  const updateMutation = useMutation({
    mutationFn: (workflow: EditorialWorkflowUpdate) => editorialCalendarService.updateWorkflowItem(workflow),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EDITORIAL_CALENDAR_KEY }),
  })

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    updateWorkflow: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
    updateError: updateMutation.isError,
  }
}
