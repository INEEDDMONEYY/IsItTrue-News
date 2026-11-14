
export type CaseFileStatus =
  | 'draft'
  | 'active'
  | 'under-review'
  | 'published'
  | 'closed'
  | 'archived'

export type CaseFilePriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'critical'

export type CaseFileAccessLevel =
  | 'internal'
  | 'restricted'
  | 'confidential'

export type CaseFileCategory =
  | 'politics'
  | 'government'
  | 'business'
  | 'public-safety'
  | 'health'
  | 'technology'
  | 'environment'
  | 'education'
  | 'international'
  | 'social-issues'
  | 'other'

export type CaseFileActorRole =
  | 'admin'
  | 'editor'
  | 'author'
  | 'investigator'
  | 'system'

export type CaseFileTimelineEventType =
  | 'created'
  | 'updated'
  | 'assignment'
  | 'status-change'
  | 'article-linked'
  | 'evidence-added'
  | 'source-added'
  | 'fact-check-linked'
  | 'review'
  | 'note'
  | 'closed'
  | 'reopened'

export interface CaseFileActor {
  id: string
  name: string
  email: string
  role: string
  type: CaseFileActorRole
  avatarUrl?: string
}

export interface CaseFileAssignment {
  id: string
  name: string
  email: string
  role: string
  assignedAt: string
}

export interface CaseFileLinkedItem {
  id: string
  title: string
  type: string
  status?: string
  description?: string
  url?: string
  thumbnailUrl?: string
  createdAt?: string
}

export interface CaseFileTimelineEvent {
  id: string
  type: CaseFileTimelineEventType
  title: string
  description: string
  actor: CaseFileActor
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface CaseFile {
  id: string
  reference: string
  title: string
  slug: string
  summary: string
  description: string
  category: CaseFileCategory
  status: CaseFileStatus
  priority: CaseFilePriority
  accessLevel: CaseFileAccessLevel

  investigationId?: string
  investigationTitle?: string

  leadInvestigator: CaseFileActor
  assignedTo: CaseFileAssignment[]

  relatedArticles: CaseFileLinkedItem[]
  evidence: CaseFileLinkedItem[]
  media: CaseFileLinkedItem[]
  sources: CaseFileLinkedItem[]
  factChecks: CaseFileLinkedItem[]

  tags: string[]
  timeline: CaseFileTimelineEvent[]

  createdBy: CaseFileActor
  updatedBy: CaseFileActor
  createdAt: string
  updatedAt: string
  dueDate?: string
  closedAt?: string

  metadata?: Record<string, unknown>
}

export interface CaseFileFilters {
  search: string
  status: CaseFileStatus | 'all'
  category: CaseFileCategory | 'all'
  priority: CaseFilePriority | 'all'
  accessLevel: CaseFileAccessLevel | 'all'
  investigatorId: string
  sortOrder: 'newest' | 'oldest' | 'recently-updated'
}

export interface CaseFilePagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface CaseFileSummary {
  totalCases: number
  activeCases: number
  pendingReview: number
  closedCases: number
  criticalCases: number
  confidentialCases: number
}

export interface CaseFileListResponse {
  data: CaseFile[]
  pagination: CaseFilePagination
}

export interface CaseFileQueryParams extends CaseFileFilters {
  page: number
  pageSize: number
}

export interface CreateCaseFileInput {
  title: string
  summary: string
  description: string
  category: CaseFileCategory
  priority: CaseFilePriority
  accessLevel: CaseFileAccessLevel
  investigationId?: string
  leadInvestigatorId: string
  assignedToIds?: string[]
  tags?: string[]
  dueDate?: string
}

export type UpdateCaseFileInput = Partial<CreateCaseFileInput> & {
  status?: CaseFileStatus
}

export interface CaseFileApiError {
  message: string
  status?: number
}
