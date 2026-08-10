
import type { AuthorArticle } from './authorArticle.types'

export type SubmissionStatus =
  | 'ready'
  | 'submitted'
  | 'editor-review'
  | 'revision-requested'
  | 'approved'
  | 'rejected'
  | 'published'

export interface SubmissionTimelineEvent {
  id: string
  label: string
  description: string
  timestamp: string
  completed: boolean
}

export interface ArticleSubmission {
  id: string
  articleId: string
  article: AuthorArticle

  status: SubmissionStatus

  submittedAt: string | null
  reviewedAt: string | null
  publishedAt: string | null

  assignedEditor: {
    id: string
    name: string
    avatar: string | null
  } | null

  editorialNote: string | null

  timeline: SubmissionTimelineEvent[]
}

