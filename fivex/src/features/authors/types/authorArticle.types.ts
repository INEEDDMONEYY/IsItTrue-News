
export type AuthorArticleStatus =
  | 'draft'
  | 'submitted'
  | 'in-review'
  | 'approved'
  | 'published'
  | 'rejected'

export type AuthorWorkflowStage =
  | 'draft'
  | 'assignment'
  | 'collaboration'
  | 'revision'
  | 'fact-check'
  | 'editor-review'
  | 'approved'
  | 'published'

export type AssignmentStatus =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'overdue'

export type RevisionStatus =
  | 'open'
  | 'in-progress'
  | 'completed'

export type FactCheckStatus =
  | 'not-submitted'
  | 'pending'
  | 'in-review'
  | 'issues-found'
  | 'verified'

export interface AuthorArticleCoAuthor {
  id: string
  name: string
  role: string
  avatar: string | null
}

export interface AuthorArticleAssignment {
  id: string
  assignedTo: string
  task: string
  status: AssignmentStatus
  dueDate: string
}

export interface AuthorArticleCollaboration {
  enabled: boolean
  coAuthors: AuthorArticleCoAuthor[]
  assignments: AuthorArticleAssignment[]
}

export interface AuthorArticleRevisionRequest {
  id: string
  requestedBy: string
  requestedAt: string
  summary: string
  status: RevisionStatus
}

export interface AuthorArticleRevisions {
  requested: boolean
  count: number
  latestRequest: AuthorArticleRevisionRequest | null
}

export interface AuthorArticleFactCheck {
  status: FactCheckStatus
  requestId: string | null
  issuesFound: number
  verifiedClaims: number
}

export interface AuthorArticleSubmission {
  ready: boolean
  submittedAt: string | null
  editorId: string | null
}

export interface AuthorArticleMetrics {
  wordCount: number
  sources: number
  evidenceItems: number
  mediaItems: number
}

export interface AuthorArticleWorkflow {
  stage: AuthorWorkflowStage
  completionPercent: number
  lastAction: string
  nextAction: string
}

export interface AuthorArticle {
  id: string
  title: string
  slug: string
  excerpt: string

  status: AuthorArticleStatus

  category: string
  tags: string[]

  authorId: string
  authorName: string

  createdAt: string
  updatedAt: string

  workflow: AuthorArticleWorkflow

  collaboration: AuthorArticleCollaboration

  revisions: AuthorArticleRevisions

  factCheck: AuthorArticleFactCheck

  submission: AuthorArticleSubmission

  metrics: AuthorArticleMetrics
}



