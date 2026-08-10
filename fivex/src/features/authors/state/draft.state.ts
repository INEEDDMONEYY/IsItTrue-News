
import type { AuthorArticleStatus } from '../types/authorArticle.types'

export interface DraftFilters {
  search: string
  status: AuthorArticleStatus | 'all'
  category: string
  collaboration: 'all' | 'solo' | 'collaborative'
}

export const defaultDraftFilters: DraftFilters = {
  search: '',
  status: 'all',
  category: 'all',
  collaboration: 'all',
}

