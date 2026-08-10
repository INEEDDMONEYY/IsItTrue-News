import { apiClient } from '@/api/client'

export type BannerTone = 'info' | 'warning' | 'success'

export interface Banner {
  id: string
  message: string
  tone: BannerTone
  active: boolean
}

export const bannersApi = {
  // Public: only active banners, for the reader-facing site and dashboards.
  listActive: async (): Promise<Banner[]> => {
    const { data } = await apiClient.get<{ banners: Banner[] }>('/api/banners')
    return data.banners
  },

  // Admin-only: every banner, active or not.
  listAll: async (): Promise<Banner[]> => {
    const { data } = await apiClient.get<{ banners: Banner[] }>('/api/banners/all')
    return data.banners
  },

  create: async (message: string, tone: BannerTone): Promise<Banner> => {
    const { data } = await apiClient.post<{ banner: Banner }>('/api/banners', { message, tone })
    return data.banner
  },

  toggleActive: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/banners/${id}/toggle`)
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/banners/${id}`)
  },
}
