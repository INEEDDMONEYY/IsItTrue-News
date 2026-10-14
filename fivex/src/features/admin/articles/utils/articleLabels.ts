import type { AdminArticleStatus, AdminFactCheckStatus, AuditAction } from '../types/adminArticle.types'

export const STATUS_LABELS: Record<AdminArticleStatus, string> = {
  draft: 'Draft',
  pending_review: 'In review',
  published: 'Published',
}

export const STATUS_ORDER: AdminArticleStatus[] = ['draft', 'pending_review', 'published']

// Same words as the reader-facing verdict badge, so the admin and public pages never disagree.
export const FACT_CHECK_LABELS: Record<AdminFactCheckStatus, string> = {
  none: 'Unverified',
  pending: 'Under review',
  approved: 'Verified',
  rejected: 'Disputed',
}

export const FACT_CHECK_ORDER: AdminFactCheckStatus[] = ['none', 'pending', 'approved', 'rejected']

// The wording of each history entry, written about the person who did it ("Ada unpublished the article").
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  created: 'created the article',
  edited: 'edited the article',
  submitted: 'submitted it for review',
  withdrawn: 'pulled it back from review',
  approved: 'approved and published it',
  changes_requested: 'sent it back with requested changes',
  published: 'published it',
  unpublished: 'unpublished it',
  status_changed: 'changed its status',
  deleted: 'deleted the article',
}

export const FIELD_LABELS: Record<string, string> = {
  title: 'Headline',
  excerpt: 'Summary',
  body: 'Text',
  category: 'Category',
  tags: 'Tags',
  articleImageUrl: 'Cover image',
  articleVideoUrl: 'Video',
  videoThumbnailUrl: 'Video thumbnail',
  socialLinks: 'Social links',
  sourceLinks: 'Sources',
}

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  author: 'Author',
}
