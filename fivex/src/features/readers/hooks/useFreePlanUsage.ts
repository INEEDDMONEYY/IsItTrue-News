import { useQuery } from '@tanstack/react-query'
import { usageApi } from '../api/usage.api'

export function useFreePlanUsage() {
  const { data, isLoading } = useQuery({
    queryKey: ['readers', 'usage', 'mine'],
    queryFn: usageApi.getMine,
  })

  return { usage: data, isLoading }
}
