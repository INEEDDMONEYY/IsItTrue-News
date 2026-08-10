// Shape of an article as returned by the public, read-only endpoints
// (/api/articles/category/:slug, /api/articles/tag/:slug, etc.) — this is
// the real backend Article document, not the mock `Article` type used
// elsewhere in the UI.
export interface PublicArticleAuthor {
  id: string
  name: string
}

export interface PublicArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  category: string
  tags: string[]
  sourceLinks: string[]
  status: 'draft' | 'pending_review' | 'published'
  factCheckStatus?: 'none' | 'pending' | 'approved' | 'rejected'
  articleImageUrl?: string
  articleVideoUrl?: string
  videoThumbnailUrl?: string
  author: PublicArticleAuthor
  views: number
  likes: number
  publishedAt?: string
  createdAt: string
}
