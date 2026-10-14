export const ARTICLE_AUDIT_ACTIONS = [
  'created',
  'edited',
  'submitted',
  'withdrawn',
  'approved',
  'changes_requested',
  'published',
  'unpublished',
  'status_changed',
  'deleted',
] as const

export type ArticleAuditAction = (typeof ARTICLE_AUDIT_ACTIONS)[number]
