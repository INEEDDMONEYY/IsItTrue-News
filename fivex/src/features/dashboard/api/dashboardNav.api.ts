import { apiClient } from '@/api/client'

export const dashboardNavApi = {
  getCounts: async (): Promise<Record<string, number>> => {
    const { data } = await apiClient.get<{ counts: Record<string, number> }>('/api/dashboard/nav-counts')
    return data.counts
  },
}
