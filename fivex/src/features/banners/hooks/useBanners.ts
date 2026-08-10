import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bannersApi, type BannerTone } from '../api/banners.api'

const ALL_QUERY_KEY = ['banners', 'all']
const ACTIVE_QUERY_KEY = ['banners', 'active']

/**
 * Admin banner management, backed by the real /api/banners endpoints.
 * Returns every banner (active + inactive) plus create/toggle/delete
 * mutations, used by the admin Banners page.
 */
export function useBanners() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ALL_QUERY_KEY,
    queryFn: bannersApi.listAll,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ALL_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ACTIVE_QUERY_KEY })
  }

  const createMutation = useMutation({
    mutationFn: ({ message, tone }: { message: string; tone: BannerTone }) =>
      bannersApi.create(message, tone),
    onSuccess: invalidate,
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => bannersApi.toggleActive(id),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannersApi.remove(id),
    onSuccess: invalidate,
  })

  return {
    banners: data ?? [],
    isLoading,
    error,
    createBanner: (message: string, tone: BannerTone) =>
      createMutation.mutateAsync({ message, tone }),
    toggleBanner: (id: string) => toggleMutation.mutateAsync(id),
    deleteBanner: (id: string) => deleteMutation.mutateAsync(id),
  }
}

/**
 * Active banners only, for rendering the site-wide banner bar in every
 * layout (reader site, author/editor dashboard, admin panel).
 */
export function useActiveBanners() {
  const { data, isLoading } = useQuery({
    queryKey: ACTIVE_QUERY_KEY,
    queryFn: bannersApi.listActive,
  })

  return {
    banners: data ?? [],
    isLoading,
  }
}
