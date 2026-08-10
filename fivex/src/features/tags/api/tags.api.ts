import { apiClient } from '@/api/client'

export interface Tag {
  id: string
  name: string
  slug: string
}

export const tagsApi = {
  list: async (): Promise<Tag[]> => {
    const { data } = await apiClient.get<{ tags: Tag[] }>('/api/tags')
    return data.tags
  },

  create: async (name: string): Promise<Tag> => {
    const { data } = await apiClient.post<{ tag: Tag }>('/api/tags', { name })
    return data.tag
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/tags/${id}`)
  },
}
