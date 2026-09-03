import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookmarksApi } from '../api/bookmarks.api'

export const bookmarksQueryKey = ['bookmarks', 'mine'] as const

export function useBookmarks() {
  const queryClient = useQueryClient()

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: bookmarksQueryKey,
    queryFn: bookmarksApi.listMine,
  })

  const removeMutation = useMutation({
    mutationFn: ({ contentType, id }: { contentType: 'article' | 'video'; id: string }) =>
      bookmarksApi.toggle(contentType, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookmarksQueryKey }),
  })

  return {
    bookmarks,
    isLoading,
    removeBookmark: (contentType: 'article' | 'video', id: string) =>
      removeMutation.mutate({ contentType, id }),
  }
}
