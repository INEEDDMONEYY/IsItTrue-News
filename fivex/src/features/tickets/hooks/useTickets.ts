import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ticketsApi, type SubmitTicketInput } from '../api/tickets.api'

const QUERY_KEY = ['tickets']

/**
 * Admin support-ticket inbox, backed by the real /api/tickets endpoints.
 * Used by the admin Tickets page.
 */
export function useTickets() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: ticketsApi.listAll,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => ticketsApi.toggleStatus(id),
    onSuccess: invalidate,
  })

  return {
    tickets: data ?? [],
    isLoading,
    error,
    toggleStatus: (id: string) => toggleMutation.mutateAsync(id),
  }
}

/**
 * Submits a support ticket from the public "Submit Ticket" form.
 */
export function useSubmitTicket() {
  const mutation = useMutation({
    mutationFn: (input: SubmitTicketInput) => ticketsApi.submit(input),
  })

  return {
    submitTicket: (input: SubmitTicketInput) => mutation.mutateAsync(input),
    isSubmitting: mutation.isPending,
    isSubmitted: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  }
}
