export const ARTICLE_STATUSES = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  PUBLISHED: 'published',
} as const

export type ArticleStatus = (typeof ARTICLE_STATUSES)[keyof typeof ARTICLE_STATUSES]

export const ALL_ARTICLE_STATUSES: ArticleStatus[] = Object.values(ARTICLE_STATUSES)
