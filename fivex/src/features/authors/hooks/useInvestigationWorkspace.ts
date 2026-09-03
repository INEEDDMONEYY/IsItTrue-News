import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { investigationWorkspaceApi } from '../api/investigations.api'
import type { CreateInvestigationInput } from '@/features/investigations/types/investigation.types'

const QUERY_KEY = ['investigations', 'mine']

/**
 * "My Investigations" — the signed-in author/editor/admin's own or
 * collaborating investigations, any status. Backed by the real
 * GET /api/investigations/mine endpoint.
 */
export function useInvestigationWorkspace() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: investigationWorkspaceApi.listMine,
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateInvestigationInput) => investigationWorkspaceApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => investigationWorkspaceApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  return {
    investigations: data ?? [],
    isLoading,
    error,
    createInvestigation: (input: CreateInvestigationInput) => createMutation.mutateAsync(input),
    isCreating: createMutation.isPending,
    deleteInvestigation: (id: string) => deleteMutation.mutateAsync(id),
  }
}
