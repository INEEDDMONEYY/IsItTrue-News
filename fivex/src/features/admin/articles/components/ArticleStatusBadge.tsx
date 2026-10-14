import type { AdminArticleStatus, AdminFactCheckStatus } from '../types/adminArticle.types'
import { FACT_CHECK_LABELS, STATUS_LABELS } from '../utils/articleLabels'

const STATUS_STYLES: Record<AdminArticleStatus, string> = {
  draft: 'bg-surface-2 text-text-muted ring-border',
  pending_review: 'bg-pending/10 text-pending ring-pending/30',
  published: 'bg-verified/10 text-verified ring-verified/30',
}

const FACT_CHECK_STYLES: Record<AdminFactCheckStatus, string> = {
  none: 'bg-surface-2 text-text-muted ring-border',
  pending: 'bg-pending/10 text-pending ring-pending/30',
  approved: 'bg-verified/10 text-verified ring-verified/30',
  rejected: 'bg-disputed/10 text-disputed ring-disputed/30',
}

const BADGE_CLASS = 'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1'

export function ArticleStatusBadge({ status }: { status: AdminArticleStatus }) {
  return <span className={`${BADGE_CLASS} ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>
}

export function FactCheckBadge({ status }: { status: AdminFactCheckStatus }) {
  return <span className={`${BADGE_CLASS} ${FACT_CHECK_STYLES[status]}`}>{FACT_CHECK_LABELS[status]}</span>
}
