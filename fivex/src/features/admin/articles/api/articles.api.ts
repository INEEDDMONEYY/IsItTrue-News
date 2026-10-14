import { apiClient } from '@/api/client'
import type {
  AdminArticleDetail,
  AdminArticleList,
  AdminArticleListParams,
  AdminAuditTrail,
  ChangeStatusInput,
} from '../types/adminArticle.types'

const BASE = '/api/admin/articles'

export const adminArticlesApi = {
  list: async (params: AdminArticleListParams): Promise<AdminArticleList> => {
    const { data } = await apiClient.get<AdminArticleList>(BASE, { params })
    return data
  },

  get: async (id: string): Promise<AdminArticleDetail> => {
    const { data } = await apiClient.get<{ article: AdminArticleDetail }>(`${BASE}/${id}`)
    return data.article
  },

  audit: async (id: string): Promise<AdminAuditTrail> => {
    const { data } = await apiClient.get<AdminAuditTrail>(`${BASE}/${id}/audit`)
    return data
  },

  changeStatus: async (id: string, input: ChangeStatusInput): Promise<AdminArticleDetail> => {
    const { data } = await apiClient.patch<{ article: AdminArticleDetail }>(`${BASE}/${id}/status`, input)
    return data.article
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
