import type { Article, VerificationStatus } from '@/shared/types/article.types'

export interface ArticleComment {
  id: string
  authorName: string
  authorAvatarUrl?: string
  content: string
  createdAt: string
  likes: number
}

export interface FactCheckDetails {
  status: VerificationStatus
  summary: string
  source: string
  checkedBy: string
  checkedAt: string
}

export interface ArticleDetail extends Article {
  content: string[]
  /**
   * Raw HTML body as authored in the rich text editor, when available.
   * Real (backend-sourced) articles preserve the author's own formatting
   * (headings, lists, bold/italic, embedded images, links) via this field;
   * mock stories don't have one and fall back to `content` paragraphs.
   */
  bodyHtml?: string
  /** Citation links the author attached when creating the article. */
  sourceLinks?: string[]
  likes: number
  dislikes: number
  reposts: number
  factCheck: FactCheckDetails
  comments: ArticleComment[]
}
