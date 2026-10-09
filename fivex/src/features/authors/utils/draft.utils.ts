
import type {
  AuthorArticle,
  AuthorArticleAssignment,
  AuthorArticleStatus,
  FactCheckStatus,
} from '../types/authorArticle.types'

export function getDraftStatusLabel(status: AuthorArticleStatus) {
  const labels: Record<AuthorArticleStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    'in-review': 'In Review',
    approved: 'Approved',
    published: 'Published',
    rejected: 'Rejected',
  }

  return labels[status]
}

export function getFactCheckStatusLabel(status: FactCheckStatus) {
  const labels: Record<FactCheckStatus, string> = {
    'not-submitted': 'Not Submitted',
    pending: 'Pending',
    'in-review': 'In Review',
    'issues-found': 'Issues Found',
    verified: 'Verified',
  }

  return labels[status]
}

export function getDraftProgress(article: AuthorArticle) {
  return Math.min(100, Math.max(0, Math.round(article.workflow.completionPercent)))
}

export function getFactCheckCount(article: AuthorArticle) {
  return article.factCheck.verifiedClaims + article.factCheck.issuesFound
}

export function getCoAuthorCount(article: AuthorArticle) {
  return article.collaboration.coAuthors.length
}

// The assignment that needs attention next: the open one that is due soonest.
export function getNextAssignment(article: AuthorArticle): AuthorArticleAssignment | null {
  const open = article.collaboration.assignments
    .filter((assignment) => assignment.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  return open[0] ?? null
}

export function isReadyToSubmit(article: AuthorArticle) {
  return article.submission.ready && article.factCheck.status === 'verified'
}

