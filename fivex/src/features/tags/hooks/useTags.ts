import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '../api/tags.api'

const QUERY_KEY = ['tags']

/**
 * Article tags, backed by the real /api/tags endpoints. Used by the
 * author's "New Article" tag input and public tag pages.
 */
export function useTags() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: tagsApi.list,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const createMutation = useMutation({
    mutationFn: (name: string) => tagsApi.create(name),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tagsApi.remove(id),
    onSuccess: invalidate,
  })

  return {
    tags: data ?? [],
    isLoading,
    error,
    createTag: (name: string) => createMutation.mutateAsync(name),
    deleteTag: (id: string) => deleteMutation.mutateAsync(id),
  }
}
