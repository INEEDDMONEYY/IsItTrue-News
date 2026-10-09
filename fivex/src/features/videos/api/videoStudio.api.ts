import { apiClient } from '@/api/client'

export const videoStudioApi = {
  getProject: (projectId: string) =>
    apiClient.get(`/videos/studio/${projectId}`),

  saveProject: (projectId: string, payload: unknown) =>
    apiClient.put(`/videos/studio/${projectId}`, payload),

  submitForReview: (projectId: string) =>
    apiClient.post(`/videos/studio/${projectId}/submit`),
}