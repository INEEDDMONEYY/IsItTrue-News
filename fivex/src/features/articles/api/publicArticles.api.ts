import { apiClient } from '@/api/client'
import type { PublicArticle } from '../types/publicArticle.types'

/**
 * Read-only, public article listing endpoints — backed by the real
 * /api/articles/category/:slug and /api/articles/tag/:slug routes. Used by
 * the category and tag pages to show real published articles alongside
 * mock filler content.
 */
export const publicArticlesApi = {
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

  getBySlug: async (slug: string): Promise<PublicArticle | null> => {
    try {
      const { data } = await apiClient.get<{ article: PublicArticle }>(
        `/api/articles/slug/${encodeURIComponent(slug)}`,
      )
      return data.article
    } catch {
      return null
    }
  },
}
