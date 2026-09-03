export type InvestigationStatus = 'draft' | 'pending_review' | 'published' | 'rejected'

export type InvestigationAccessTier = 'anonymous' | 'free' | 'premium'

export interface InvestigationAuthorSummary {
  id: string
  name: string
  authorProfile?: {
    professionalName?: string
    profileImage?: string
  }
}

export interface PublicTimelineEntry {
  id: string
  date: string
  title: string
  description?: string
  locked: boolean
}

export interface InvestigationComment {
  id: string
  user: string | { id: string; name: string }
  content: string
  createdAt: string
}

/** Sanitized, reader-facing summary — used on the public listing page. */
export interface PublicInvestigationSummary {
  id: string
  title: string
  subheadline?: string
  slug: string
  summary: string
  coverImage?: string
  category?: string
  author: InvestigationAuthorSummary
  publishedAt?: string
  followersCount: number
  bookmarksCount: number
  viewsCount: number
}

/** Sanitized, reader-facing detail — used on the public detail page. */
export interface PublicInvestigationDetail extends PublicInvestigationSummary {
  bodyHtml?: string
  timeline: PublicTimelineEntry[]
  comments: InvestigationComment[]
  following: boolean
  bookmarked: boolean
  status: InvestigationStatus
}

export interface FullTimelineEntry {
  id: string
  date: string
  title: string
  description: string
  visibility: 'public' | 'internal'
}

export interface EditorComment {
  id: string
  editor: string | { id: string; name: string }
  message: string
  createdAt: string
}

/** Full, unsanitized workspace view — author/collaborator/editor/admin only. */
export interface WorkspaceInvestigation {
  id: string
  title: string
  subheadline?: string
  slug: string
  summary: string
  coverImage?: string
  category?: string
  author: InvestigationAuthorSummary | string
  collaborators: string[]
  status: InvestigationStatus
  bodyHtml?: string
  timeline: FullTimelineEntry[]
  internalNotes?: string
  editorComments: EditorComment[]
  rejectionReason?: string
  publishedAt?: string
  followersCount: number
  bookmarksCount: number
  comments: InvestigationComment[]
  viewsCount: number
  createdAt: string
  updatedAt: string
}

export interface GetInvestigationResponse {
  investigation: PublicInvestigationDetail | WorkspaceInvestigation
  workspace: boolean
  access?: { tier: InvestigationAccessTier }
}

export interface CreateInvestigationInput {
  title: string
  subheadline?: string
  summary: string
  coverImage?: string
  category?: string
  bodyHtml?: string
}

export type UpdateInvestigationInput = Partial<CreateInvestigationInput> & {
  internalNotes?: string
  collaborators?: string[]
}

export interface AddTimelineEntryInput {
  date: string
  title: string
  description: string
  visibility?: 'public' | 'internal'
}
