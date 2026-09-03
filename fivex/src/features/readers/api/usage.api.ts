import { apiClient } from '@/api/client'

// Drives the "Free Plan Usage Tracking" widget in the reader sidebar.
export interface FreePlanUsage {
  plan: 'free' | 'premium'
  articlesRead: number
  articlesLimit: number | null
  articlesRemaining: number | null
  maxFreeVideoDurationSeconds: number
  searchesUsed: number
  searchesLimit: number | null
  searchesRemaining: number | null
  commentsUsed: number
  commentsLimit: number | null
  commentsRemaining: number | null
  resetDate: string
}

export const usageApi = {
  getMine: async (): Promise<FreePlanUsage> => {
    const { data } = await apiClient.get<{ usage: FreePlanUsage }>('/api/users/me/usage')
    return data.usage
  },
}
