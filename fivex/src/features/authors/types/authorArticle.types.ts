export type ArticleStatus = 'draft' | 'pending_review' | 'published'
export type ArticleFactCheckStatus = 'none' | 'pending' | 'approved' | 'rejected'

export interface AuthorArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string[]
  status: ArticleStatus
  createdAt: string
  views: number
  articleImageUrl?: string
  articleVideoUrl?: string
  videoThumbnailUrl?: string
  socialLinks?: string[]
  sourceLinks?: string[]
  factCheckStatus?: ArticleFactCheckStatus
  factCheckRejectionReason?: string
}

export interface CreateArticleInput {
  title: string
  excerpt: string
  body: string
  category: string
  // Authors no longer route through an editorial review status: a new
  // article is either kept as a private draft or posted (published) right
  // away, regardless of any status check.
  status: Extract<ArticleStatus, 'draft' | 'published'>
  tags?: string[]
  articleImageUrl?: string
  articleVideoUrl?: string
  videoThumbnailUrl?: string
  socialLinks?: string[]
  sourceLinks?: string[]
}
