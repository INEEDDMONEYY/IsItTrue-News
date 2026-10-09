import type { Article, VerificationStatus } from '@/shared/types/article.types'

export interface ArticleComment {
  id: string
  authorId?: string
  authorName: string
  authorAvatarUrl?: string
  content: string
  createdAt: string
  likes: number
  liked?: boolean
}

export interface FactCheckDetails {
  status: VerificationStatus
  summary: string
  source: string
  checkedBy: string
  checkedById?: string
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
  /**
   * True when the backend withheld the full body because a free-plan
   * reader hit their monthly article cap. Mock stories are never locked.
   */
  locked?: boolean
  /** Citation links the author attached when creating the article. */
  sourceLinks?: string[]
  /** Published correction notices, numbered per article. */
  corrections?: { number: number; text: string; publishedAt: string }[]
  likes: number
  dislikes: number
  reposts: number
  bookmarks: number
  factCheck: FactCheckDetails
  comments: ArticleComment[]
}
