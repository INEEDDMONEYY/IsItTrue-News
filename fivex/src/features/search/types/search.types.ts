export type SearchResultType = 'article' | 'video' | 'author' | 'topic'
export type SearchType = 'all' | 'articles' | 'videos' | 'authors' | 'topics'
export type SearchAccessLevel = 'anonymous' | 'free' | 'premium'

export interface SearchResultItem {
  id: string
  type: SearchResultType
  title: string
  description?: string
  imageUrl?: string
  href: string
}

export interface SearchResponse {
  articles: SearchResultItem[]
  videos: SearchResultItem[]
  authors: SearchResultItem[]
  topics: SearchResultItem[]
  accessLevel: SearchAccessLevel
  usage: { limit: number | null; remaining: number | null }
  filtersAllowed: boolean
}
