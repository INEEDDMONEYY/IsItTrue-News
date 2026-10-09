import { apiClient } from '@/api/client'
import type { PublicArticle } from '../types/publicArticle.types'

/**
 * Read-only, public article listing endpoints — backed by the real
 * /api/articles/category/:slug and /api/articles/tag/:slug routes. Used by
 * the category and tag pages to show real published articles alongside
 * mock filler content.
 */
export const publicArticlesApi = {
  listLatest: async (limit = 5): Promise<PublicArticle[]> => {
    const { data } = await apiClient.get<{ articles: PublicArticle[] }>('/api/articles/latest', {
      params: { limit },
    })
    return data.articles
  },

  listByCategory: async (slug: string): Promise<PublicArticle[]> => {
    const { data } = await apiClient.get<{ articles: PublicArticle[] }>(
      `/api/articles/category/${encodeURIComponent(slug)}`,
    )
    return data.articles
  },

  listByTag: async (slug: string): Promise<PublicArticle[]> => {
    const { data } = await apiClient.get<{ articles: PublicArticle[] }>(
      `/api/articles/tag/${encodeURIComponent(slug)}`,
    )
    return data.articles
  },

  getBySlug: async (
    slug: string,
  ): Promise<{ article: PublicArticle; liked: boolean; disliked: boolean; bookmarked: boolean } | null> => {
    try {
      const { data } = await apiClient.get<{
        article: PublicArticle
        liked: boolean
        disliked: boolean
        bookmarked: boolean
      }>(`/api/articles/slug/${encodeURIComponent(slug)}`)
      return data
    } catch {
      return null
    }
  },

  toggleLike: async (id: string): Promise<{ liked: boolean; likesCount: number }> => {
    const { data } = await apiClient.post<{ liked: boolean; likesCount: number }>(
      `/api/articles/${id}/like`,
    )
    return data
  },

  toggleDislike: async (id: string): Promise<{ disliked: boolean; dislikesCount: number }> => {
    const { data } = await apiClient.post<{ disliked: boolean; dislikesCount: number }>(
      `/api/articles/${id}/dislike`,
    )
    return data
  },

  share: async (id: string): Promise<{ sharesCount: number }> => {
    const { data } = await apiClient.post<{ sharesCount: number }>(`/api/articles/${id}/share`)
    return data
  },

  toggleBookmark: async (id: string): Promise<{ bookmarked: boolean; bookmarksCount: number }> => {
    const { data } = await apiClient.post<{ bookmarked: boolean; bookmarksCount: number }>(
      `/api/articles/${id}/bookmark`,
    )
    return data
  },
}
