import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authorProfileApi } from '../api/authorProfile.api'

export function useAuthorProfile(authorId: string | undefined) {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['authorProfile', authorId],
    queryFn: () => authorProfileApi.getProfile(authorId!),
    enabled: Boolean(authorId),
  })

  const articlesQuery = useQuery({
    queryKey: ['authorProfile', authorId, 'articles'],
    queryFn: () => authorProfileApi.listArticles(authorId!),
    enabled: Boolean(authorId),
  })

  const videosQuery = useQuery({
    queryKey: ['authorProfile', authorId, 'videos'],
    queryFn: () => authorProfileApi.listVideos(authorId!),
    enabled: Boolean(authorId),
  })

  const libraryQuery = useQuery({
    queryKey: ['authorProfile', authorId, 'library'],
    queryFn: () => authorProfileApi.listLibrary(authorId!),
    enabled: Boolean(authorId),
  })

  const followMutation = useMutation({
    mutationFn: () => authorProfileApi.toggleFollow(authorId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorProfile', authorId] })
    },
  })

  return {
    profile: profileQuery.data?.user,
    isFollowing: profileQuery.data?.isFollowing ?? false,
    stats: profileQuery.data?.stats,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    articles: articlesQuery.data ?? [],
    isLoadingArticles: articlesQuery.isLoading,
    videos: videosQuery.data ?? [],
    isLoadingVideos: videosQuery.isLoading,
    library: libraryQuery.data ?? [],
    isLoadingLibrary: libraryQuery.isLoading,
    toggleFollow: () => followMutation.mutate(),
    isTogglingFollow: followMutation.isPending,
  }
}
