import { apiClient } from '@/api/client'
import type {
  ArticleFactCheck,
  PublicFactCheck,
  PublicFactCheckList,
  PublicFactCheckListParams,
} from '../types/publicFactCheck.types'

const BASE = '/api/public/fact-checks'

export const publicFactChecksApi = {
  list: async (params: PublicFactCheckListParams): Promise<PublicFactCheckList> => {
    const { data } = await apiClient.get<PublicFactCheckList>(BASE, { params })
    return data
  },

  get: async (id: string): Promise<PublicFactCheck> => {
    const { data } = await apiClient.get<{ factCheck: PublicFactCheck }>(`${BASE}/${encodeURIComponent(id)}`)
    return data.factCheck
  },

  // The verdict and the checked claims behind a published story, for the article page.
  forArticle: async (slug: string): Promise<ArticleFactCheck> => {
    const { data } = await apiClient.get<ArticleFactCheck>(`${BASE}/article/${encodeURIComponent(slug)}`)
    return data
  },
}
