import type { ArticleReviewInfo } from '@/shared/types/articleReview.types'

export interface PendingArticle extends ArticleReviewInfo {
  id: string
  title: string
  slug: string
  excerpt: string
  // Raw HTML from the author's rich-text editor — sanitize before rendering.
  body: string
  category: string
  tags?: string[]
  articleImageUrl?: string
  sourceLinks?: string[]
  submittedAt?: string
  createdAt: string
  author?: { name?: string } | null
}
