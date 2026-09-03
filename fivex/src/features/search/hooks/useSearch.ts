import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { searchService } from '../services/search.service'
import type { SearchType } from '../types/search.types'

/**
 * Debounces the raw query, then fetches results from the backend once it's
 * at least 2 characters. Role/plan gating (anonymous unfiltered + unlimited,
 * free-plan capped, premium unlimited) is enforced server-side; this hook
 * just surfaces whatever the backend returns (including 429 limit errors).
 */
export function useSearch(query: string, type: SearchType = 'all') {
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim())

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timeout)
  }, [query])

  const enabled = debouncedQuery.length > 1

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['search', debouncedQuery, type],
    queryFn: () => searchService.search(debouncedQuery, type),
    enabled,
    staleTime: 30_000,
    retry: false,
  })

  return {
    results: data,
    isLoading: enabled && (isLoading || isFetching),
    error: enabled ? error : null,
    debouncedQuery,
  }
}
