export type BookmarkContentType =
  | 'article'
  | 'investigation'
  | 'fact-check'
  | 'video'
  | 'source'
  | 'evidence'

export interface BookmarkItem {
  id: string
  title: string
  description?: string
  type: BookmarkContentType
  category?: string
  author?: string
  image?: string
  savedAt: string
  readTime?: string
  status?: string
  href: string
}