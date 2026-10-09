import { apiClient } from '@/api/client'
import type { AnalyticsOverview } from '../types/analytics.types'

export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const { data } = await apiClient.get<{ overview: AnalyticsOverview }>('/api/analytics/overview')
    return data.overview
  },
}
