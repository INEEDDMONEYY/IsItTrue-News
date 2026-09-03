import { apiClient } from '@/api/client'
import type { PublicArticle } from '@/features/articles/types/publicArticle.types'
import type {
  PublicAuthorProfileResponse,
  PublicAuthorVideo,
  PublicLibraryItem,
} from '../types/authorProfile.types'

/**
 * Thin wrapper around the real, public /api/users/:id/profile,
 * /api/articles/author/:id and /api/videos/author/:id routes.
 */
export const authorProfileApi = {
  getProfile: async (id: string): Promise<PublicAuthorProfileResponse> => {
    const { data } = await apiClient.get<PublicAuthorProfileResponse>(`/api/users/${id}/profile`)
    return data
  },

  toggleFollow: async (id: string): Promise<{ following: boolean; followersCount: number }> => {
    const { data } = await apiClient.post<{ following: boolean; followersCount: number }>(
      `/api/users/${id}/follow`,
    )
    return data
  },

  listArticles: async (id: string): Promise<PublicArticle[]> => {
    const { data } = await apiClient.get<{ articles: PublicArticle[] }>(
      `/api/articles/author/${id}`,
    )
    return data.articles
  },

  listVideos: async (id: string): Promise<PublicAuthorVideo[]> => {
    const { data } = await apiClient.get<{ videos: PublicAuthorVideo[] }>(
      `/api/videos/author/${id}`,
    )
    return data.videos
  },

  listLibrary: async (id: string): Promise<PublicLibraryItem[]> => {
    const { data } = await apiClient.get<{ items: PublicLibraryItem[] }>(
      `/api/users/${id}/library`,
    )
    return data.items
  },
}
