import { useEffect, useState } from 'react'
import { locationsApi } from '../api/locations.api'
import type { LocationView } from '../types/location.types'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 250

export function useLocationSearch(query: string) {
  const [results, setResults] = useState<LocationView[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) return

    let active = true
    const timer = window.setTimeout(() => {
      setStatus('loading')
      locationsApi
        .search(trimmed)
        .then((items) => {
          if (!active) return
          setResults(items)
          setStatus('ready')
        })
        .catch(() => {
          if (active) setStatus('error')
        })
    }, DEBOUNCE_MS)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [query])

  if (query.trim().length < MIN_QUERY_LENGTH) {
    return { results: [] as LocationView[], status: 'idle' as const }
  }
  return { results, status }
}
