import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { factCheckRequestsApi } from '../api/factCheckRequests.api'
import type { CreateFactCheckRequestInput } from '../types/factCheckRequest.types'

const QUERY_KEY = ['fact-checks', 'mine']

/**
 * The signed-in author/editor's own fact-check requests, backed by the real
 * /api/fact-checks endpoints.
 */
export function useFactCheckRequests() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: factCheckRequestsApi.listMine,
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateFactCheckRequestInput) => factCheckRequestsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  return {
    requests: data ?? [],
    isLoading,
    error,
    submitRequest: (input: CreateFactCheckRequestInput) => createMutation.mutateAsync(input),
  }
}
