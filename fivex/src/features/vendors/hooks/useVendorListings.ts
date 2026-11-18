import { useQuery } from '@tanstack/react-query'
import { vendorsApi } from '../api/vendors.api'

// A failed lookup just hides the section, so the page never waits on or shows an error for it.
export function useVendorListings() {
  const { data } = useQuery({
    queryKey: ['vendor-listings'],
    queryFn: vendorsApi.getVendors,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
  return data ?? []
}
