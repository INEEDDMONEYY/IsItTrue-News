export type AdminArticleStatus = 'draft' | 'pending_review' | 'published'
export type AdminFactCheckStatus = 'none' | 'pending' | 'approved' | 'rejected'
export type AdminArticleSortField = 'createdAt' | 'updatedAt' | 'views' | 'title'
export type SortOrder = 'asc' | 'desc'

export interface AdminPersonRef {
  id: string
  name: string
}

export interface AdminArticleRow {
  id: string
  title: string
  slug: string
  category: string
  status: AdminArticleStatus
  factCheckStatus: AdminFactCheckStatus
  // null when the author's account no longer exists.
  author: AdminPersonRef | null
  views: number
  likes: number
  editorialStage: string | null
  editorialDeadline: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  submittedAt: string | null
}

export interface AdminArticleDetail extends AdminArticleRow {
  excerpt: string
  // HTML written by the author; sanitize before rendering.
  body: string
  tags: string[]
  readTimeMinutes: number
  articleImageUrl: string | null
  articleVideoUrl: string | null
  videoThumbnailUrl: string | null
  sourceLinks: string[]
  socialLinks: string[]
  reviewNote: string | null
  reviewRequirements: { id: string; text: string; done: boolean }[]
  reviewedAt: string | null
  reviewedBy: AdminPersonRef | null
  corrections: { number: number; text: string; publishedAt: string }[]
  factCheckRejectionReason: string | null
  factCheckReviewedAt: string | null
  factCheckReviewedBy: AdminPersonRef | null
  engagement: { likes: number; dislikes: number; shares: number; bookmarks: number }
  // Decided by the server, so the page offers only moves it will accept.
  allowedStatuses: AdminArticleStatus[]
}

export interface AdminArticleListParams {
  q?: string
  status?: AdminArticleStatus
  category?: string
  factCheckStatus?: AdminFactCheckStatus
  from?: string
  to?: string
  sort: AdminArticleSortField
  order: SortOrder
  page: number
  pageSize: number
}

export interface AdminArticleList {
  articles: AdminArticleRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  counts: Record<AdminArticleStatus | 'all', number>
  categories: string[]
}

export type AuditAction =
  | 'created'
  | 'edited'
  | 'submitted'
  | 'withdrawn'
  | 'approved'
  | 'changes_requested'
  | 'published'
  | 'unpublished'
  | 'status_changed'
  | 'deleted'

export interface AdminAuditEntry {
  id: string
  action: AuditAction
  actor: { id: string; name: string; role: string }
  fromStatus: AdminArticleStatus | null
  toStatus: AdminArticleStatus | null
  note: string | null
  changedFields: string[]
  createdAt: string
}

export interface AdminAuditTrail {
  entries: AdminAuditEntry[]
  total: number
}

export interface ChangeStatusInput {
  status: AdminArticleStatus
  note?: string
}
