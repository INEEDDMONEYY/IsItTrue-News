import { useQuery } from '@tanstack/react-query'
import { investigationsApi } from '../api/investigations.api'

/**
 * Public, reader-facing feed of published investigations for the
 * /investigations listing page.
 */
export function useInvestigations(category?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['investigations', 'published', category ?? 'all'],
    queryFn: () => investigationsApi.listPublished(category),
  })

  return {
    investigations: data ?? [],
    isLoading,
    error,
  }
}
