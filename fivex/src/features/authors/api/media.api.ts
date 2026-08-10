import { apiClient } from '@/api/client'
import type { Media } from '../types/media.types'

/**
 * Uploads a single image/video file to the backend, which streams it to
 * Cloudinary and returns the stored asset record.
 *
 * `apiClient` sets a default `Content-Type: application/json` header, which
 * would otherwise be sent as-is on this request and stop the browser from
 * attaching the multipart boundary — the request body wouldn't parse and
 * the server would see no file at all. Explicitly clearing it here lets the
 * browser set the correct `multipart/form-data; boundary=...` header.
 */
export const mediaApi = {
  upload: async (file: File): Promise<Media> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post<{ media: Media }>('/api/media', formData, {
      headers: { 'Content-Type': undefined },
    })
    return data.media
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/media/${id}`)
  },
}
