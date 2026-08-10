import { apiClient } from '@/api/client'

export interface Category {
  id: string
  name: string
  slug: string
}

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<{ categories: Category[] }>('/api/categories')
    return data.categories
  },

  create: async (name: string): Promise<Category> => {
    const { data } = await apiClient.post<{ category: Category }>('/api/categories', { name })
    return data.category
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/categories/${id}`)
  },
}
