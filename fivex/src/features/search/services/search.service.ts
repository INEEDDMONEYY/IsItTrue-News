import { searchApi } from '../api/search.api'
import type { SearchType } from '../types/search.types'

export const searchService = {
  async search(q: string, type: SearchType) {
    const response = await searchApi.search(q, type)
    return response.data
  },
}
