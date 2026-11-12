import { apiClient } from '@/api/client'
import type { AdAsset } from '../types/advertiser.types'

const BASE = '/api/advertiser/library'

export const libraryApi = {
  list: async (): Promise<AdAsset[]> => {
    const { data } = await apiClient.get<{ assets: AdAsset[] }>(BASE)
    return data.assets
  },

  upload: async (file: File): Promise<AdAsset> => {
    const formData = new FormData()
    formData.append('file', file)
    // Let the browser set the multipart boundary.
    const { data } = await apiClient.post<{ asset: AdAsset }>(BASE, formData, { headers: { 'Content-Type': undefined } })
    return data.asset
  },

  rename: async (id: string, name: string): Promise<AdAsset> => {
    const { data } = await apiClient.patch<{ asset: AdAsset }>(`${BASE}/${encodeURIComponent(id)}`, { name })
    return data.asset
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${encodeURIComponent(id)}`)
  },
}
