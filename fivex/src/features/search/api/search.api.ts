import { apiClient } from '@/api/client'
import { SEARCH_ENDPOINTS } from './search.endpoints'
import type { SearchResponse, SearchType } from '../types/search.types'

export const searchApi = {
  search: (q: string, type: SearchType) =>
    apiClient.get<SearchResponse>(SEARCH_ENDPOINTS.search, { params: { q, type } }),
}
