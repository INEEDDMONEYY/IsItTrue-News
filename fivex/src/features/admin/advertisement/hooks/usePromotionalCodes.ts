import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { promotionalCodesApi } from '../api/promotionalCodes.api'
import type { PromotionalCodeRecord } from '../utils/promotionalCodes'

const QUERY_KEY = ['advertisement', 'promotional-codes'] as const

export function usePromotionalCodes() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const query = useQuery({ queryKey: QUERY_KEY, queryFn: promotionalCodesApi.list })

  const createCode = useMutation({
    mutationFn: (input: PromotionalCodeRecord) => promotionalCodesApi.create(input),
    onSuccess: invalidate,
  })

  const updateCode = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PromotionalCodeRecord }) =>
      promotionalCodesApi.update(id, input),
    onSuccess: invalidate,
  })

  const deleteCode = useMutation({
    mutationFn: (id: string) => promotionalCodesApi.remove(id),
    onSuccess: invalidate,
  })

  return { query, createCode, updateCode, deleteCode }
}
