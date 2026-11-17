import { apiClient } from '@/api/client'
import { API_BASE_URL } from '@/config/env'

export const articleViewsApi = {
  recordView: async (articleId: string): Promise<{ viewId: string }> => {
    const { data } = await apiClient.post<{ viewId: string }>(`/api/articles/${articleId}/view`)
    return data
  },

  // Sent with keepalive so the request survives page unload. It uses JSON, which the backend parses.
  recordReadingTime: (articleId: string, viewId: string, seconds: number): void => {
    void fetch(`${API_BASE_URL}/api/articles/${articleId}/reading-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewId, seconds: Math.round(seconds) }),
      keepalive: true,
    }).catch(() => undefined)
  },
}
