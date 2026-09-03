export const INVESTIGATION_STATUSES = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
} as const

export type InvestigationStatus = (typeof INVESTIGATION_STATUSES)[keyof typeof INVESTIGATION_STATUSES]

export const ALL_INVESTIGATION_STATUSES: InvestigationStatus[] = Object.values(INVESTIGATION_STATUSES)
