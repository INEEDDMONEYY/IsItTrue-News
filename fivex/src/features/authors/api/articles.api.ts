import { apiClient } from '@/api/client'
import type { ArticleStatus, AuthorArticle, CreateArticleInput } from '../types/authorArticle.types'

/**
 * Shared articles API client used by both the author dashboard and the
 * editor review queue — articles are a single backend resource, just
 * filtered/authorized differently depending on the caller's role.
 */
export const articlesApi = {
  listMine: async (): Promise<AuthorArticle[]> => {
    const { data } = await apiClient.get<{ articles: AuthorArticle[] }>('/api/articles/mine')
    return data.articles
  },

  // Public feed of published articles — used by editors to pick an article
  // to request a fact check for, since editors don't necessarily own any.
  listPublished: async (): Promise<AuthorArticle[]> => {
    const { data } = await apiClient.get<{ articles: AuthorArticle[] }>('/api/articles')
    return data.articles
  },

  listPending: async (): Promise<AuthorArticle[]> => {
    const { data } = await apiClient.get<{ articles: AuthorArticle[] }>('/api/articles/pending')
    return data.articles
  },

  create: async (input: CreateArticleInput): Promise<AuthorArticle> => {
    const { data } = await apiClient.post<{ article: AuthorArticle }>('/api/articles', input)
    return data.article
  },

  updateStatus: async (id: string, status: ArticleStatus): Promise<void> => {
    await apiClient.patch(`/api/articles/${id}/status`, { status })
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/articles/${id}`)
  },
}
