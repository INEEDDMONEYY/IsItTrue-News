import { useQuery } from '@tanstack/react-query'
import { adsApi, type AdRequest } from '../api/ads.api'

// A failed or empty lookup just means no ad in this slot, so the page never waits on or shows an error for ads.
export function usePublicAd(request: AdRequest) {
  const { data } = useQuery({
    queryKey: ['ads', request.placement, request.page ?? null, request.category ?? null],
    queryFn: () => adsApi.getAd(request),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
  return data ?? null
}
