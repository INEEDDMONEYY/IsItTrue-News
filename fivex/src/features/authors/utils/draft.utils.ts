
import type {
  AuthorArticle,
  AuthorArticleStatus,
  FactCheckStatus,
} from '../types/authorArticle.types'

export function getDraftStatusLabel(status: AuthorArticleStatus) {
  const labels: Record<AuthorArticleStatus, string> = {
    draft: 'Draft',
    'in-progress': 'In Progress',
    'fact-check-needed': 'Fact Check Needed',
    'fact-checking': 'Fact Checking',
    'editorial-review': 'Editorial Review',
    'revision-requested': 'Revision Requested',
    'ready-to-submit': 'Ready to Submit',
    submitted: 'Submitted',
  }

  return labels[status]
}

export function getFactCheckStatusLabel(status: FactCheckStatus) {
  const labels: Record<FactCheckStatus, string> = {
    'not-started': 'Not Started',
    requested: 'Requested',
    'in-progress': 'In Progress',
    verified: 'Verified',
    'needs-revision': 'Needs Revision',
  }

  return labels[status]
}

export function getDraftProgress(article: AuthorArticle) {
  const completedSteps = [
    article.wordCount > 0,
    article.sources.length > 0,
    article.factCheckStatus === 'verified',
    article.status === 'editorial-review' ||
      article.status === 'ready-to-submit' ||
      article.status === 'submitted',
  ].filter(Boolean).length

  return Math.round((completedSteps / 4) * 100)
}

export function getFactCheckCount(article: AuthorArticle) {
  return article.factChecks.length
}

export function getVerifiedSourceCount(article: AuthorArticle) {
  return article.sources.filter((source) => source.verified).length
}

export function getCoAuthorCount(article: AuthorArticle) {
  return article.collaborators.filter(
    (collaborator) => collaborator.role === 'co-author',
  ).length
}

export function isReadyToSubmit(article: AuthorArticle) {
  return (
    article.status === 'ready-to-submit' &&
    article.factCheckStatus === 'verified'
  )
}

