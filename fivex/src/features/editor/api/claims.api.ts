import { apiClient } from '@/api/client'
import type { Claim, ClaimUpdate, FactCheckArticle, NewEvidence } from '../types/claim.types'

export const claimsApi = {
  list: async (): Promise<Claim[]> => {
    const { data } = await apiClient.get<{ claims: Claim[] }>('/api/claims')
    return data.claims
  },

  listArticles: async (): Promise<FactCheckArticle[]> => {
    const { data } = await apiClient.get<{ articles: FactCheckArticle[] }>('/api/claims/articles')
    return data.articles
  },

  create: async (input: { articleId: string; text: string }): Promise<void> => {
    await apiClient.post('/api/claims', input)
  },

  takeResponsibility: async (id: string): Promise<void> => {
    await apiClient.post(`/api/claims/${id}/take`)
  },

  update: async (id: string, input: ClaimUpdate): Promise<void> => {
    await apiClient.patch(`/api/claims/${id}`, input)
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/claims/${id}`)
  },

  addEvidence: async (id: string, input: NewEvidence): Promise<void> => {
    await apiClient.post(`/api/claims/${id}/evidence`, input)
  },

  removeEvidence: async (id: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/api/claims/${id}/evidence/${itemId}`)
  },

  setArticleFactChecked: async (articleId: string, factChecked: boolean): Promise<void> => {
    await apiClient.patch(`/api/claims/articles/${articleId}/fact-check`, { factChecked })
  },
}
