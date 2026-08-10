export const FACT_CHECK_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export type FactCheckStatus = (typeof FACT_CHECK_STATUSES)[keyof typeof FACT_CHECK_STATUSES]
