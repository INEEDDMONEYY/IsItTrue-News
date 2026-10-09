// Shape of an article as returned by the public, read-only endpoints
// (/api/articles/category/:slug, /api/articles/tag/:slug, etc.) — this is
// the real backend Article document, not the mock `Article` type used
// elsewhere in the UI.
export interface PublicArticleAuthor {
  id: string
  name: string
}

export interface PublishedCorrectionNotice {
  number: number
  text: string
  publishedAt: string
}

export interface PublicArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  // Omitted by the backend when this reader has hit their free-plan monthly
  // article cap — see `locked`.
  body?: string
  // Present on teaser lists that omit the body (e.g. the homepage Latest Posts).
  readTimeMinutes?: number
  category: string
  tags: string[]
  sourceLinks: string[]
  // Numbered per article (1, 2, 3...) and never removed once published.
  corrections?: PublishedCorrectionNotice[]
  status: 'draft' | 'pending_review' | 'published'
  factCheckStatus?: 'none' | 'pending' | 'approved' | 'rejected'
  factCheckReviewedBy?: { id: string; name: string }
  articleImageUrl?: string
  articleVideoUrl?: string
  videoThumbnailUrl?: string
  author: PublicArticleAuthor
  views: number
  likes: number
  dislikes: number
  shares: number
  bookmarks: number
  publishedAt?: string
  createdAt: string
  // True when the full body was withheld because a free-plan reader is
  // past their monthly unlock cap. Headline/excerpt stay available either way.
  locked: boolean
}
