import { client } from '@/api/client'

export const videoStudioApi = {
  getProject: (projectId: string) =>
    client.get(`/videos/studio/${projectId}`),

  saveProject: (projectId: string, payload: unknown) =>
    client.put(`/videos/studio/${projectId}`, payload),

  submitForReview: (projectId: string) =>
    client.post(`/videos/studio/${projectId}/submit`),
}