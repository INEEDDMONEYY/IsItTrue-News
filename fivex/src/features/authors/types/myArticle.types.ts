import type { ArticleReviewInfo } from '@/shared/types/articleReview.types'

// The real shape returned by GET /api/articles/mine and GET /api/articles/:id for the owner.
export interface MyArticle extends ArticleReviewInfo {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  category: string
  tags?: string[]
  articleImageUrl?: string
  articleVideoUrl?: string
  videoThumbnailUrl?: string
  socialLinks?: string[]
  sourceLinks?: string[]
  status: 'draft' | 'pending_review' | 'published'
  factCheckStatus: 'none' | 'pending' | 'approved' | 'rejected'
  views: number
  submittedAt?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateArticleInput {
  title?: string
  excerpt?: string
  body?: string
  category?: string
  tags?: string[]
  articleImageUrl?: string | null
  articleVideoUrl?: string | null
  videoThumbnailUrl?: string | null
  socialLinks?: string[]
  sourceLinks?: string[]
}
