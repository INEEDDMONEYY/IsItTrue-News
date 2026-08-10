import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../api/categories.api'

const QUERY_KEY = ['categories']

/**
 * Article categories, backed by the real /api/categories endpoints. Used by
 * both the author's "New Article" category dropdown and the admin
 * categories management page.
 */
export function useCategories() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: categoriesApi.list,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const createMutation = useMutation({
    mutationFn: (name: string) => categoriesApi.create(name),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: invalidate,
  })

  return {
    categories: data ?? [],
    isLoading,
    error,
    createCategory: (name: string) => createMutation.mutateAsync(name),
    deleteCategory: (id: string) => deleteMutation.mutateAsync(id),
  }
}
