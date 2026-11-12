import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { libraryApi } from '../api/library.api'
import { ADVERTISER_QUERY_KEY } from './useAdvertiserOverview'

const LIBRARY_KEY = [...ADVERTISER_QUERY_KEY, 'library'] as const

export function useAdLibrary() {
  return useQuery({ queryKey: LIBRARY_KEY, queryFn: libraryApi.list })
}

export function useAdLibraryActions() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ADVERTISER_QUERY_KEY })

  const upload = useMutation({ mutationFn: libraryApi.upload, onSuccess: invalidate })
  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => libraryApi.rename(id, name),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: libraryApi.remove, onSuccess: invalidate })

  return { upload, rename, remove }
}
