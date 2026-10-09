// Mirrors the review fields on backend/modules/articles/models/Article.ts.
export interface ReviewRequirement {
  id: string
  text: string
  done: boolean
}

export interface ArticleReviewInfo {
  reviewNote?: string
  reviewRequirements?: ReviewRequirement[]
  reviewedAt?: string
  reviewedBy?: { name?: string } | null
}
