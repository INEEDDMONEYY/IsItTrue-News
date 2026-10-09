// Mirrors backend/modules/corrections/models/Correction.ts.
export type CorrectionStatus = 'queued' | 'investigating' | 'published' | 'dismissed'

export type CorrectionCategory = 'factual-error' | 'misattribution' | 'outdated-information' | 'typo' | 'other'

export type InvestigationVerdict = 'confirmed' | 'partially-confirmed' | 'not-confirmed'

export type CorrectionHistoryAction =
  | 'reported'
  | 'investigation_started'
  | 'findings_recorded'
  | 'published'
  | 'dismissed'

export interface CorrectionHistoryEntry {
  action: CorrectionHistoryAction
  byName: string
  at: string
  note?: string
}

export interface Correction {
  id: string
  article: string
  articleTitle: string
  articleSlug: string
  status: CorrectionStatus
  category: CorrectionCategory
  description: string
  suggestedFix?: string
  evidenceLinks: string[]
  reportedByName: string
  investigation?: {
    investigatorName: string
    startedAt: string
    findings?: string
    verdict?: InvestigationVerdict
  }
  publication?: {
    number: number
    text: string
    publishedByName: string
    publishedAt: string
  }
  dismissal?: {
    reason: string
    dismissedByName: string
    dismissedAt: string
  }
  history: CorrectionHistoryEntry[]
  createdAt: string
  updatedAt: string
}

export type CorrectionCounts = Record<CorrectionStatus, number>

export interface CreateCorrectionInput {
  articleId: string
  category: CorrectionCategory
  description: string
  suggestedFix?: string
  evidenceLinks?: string[]
}

export const CATEGORY_LABELS: Record<CorrectionCategory, string> = {
  'factual-error': 'Factual error',
  misattribution: 'Misattribution',
  'outdated-information': 'Outdated information',
  typo: 'Typo',
  other: 'Other',
}

export const VERDICT_LABELS: Record<InvestigationVerdict, string> = {
  confirmed: 'Error confirmed',
  'partially-confirmed': 'Partially confirmed',
  'not-confirmed': 'Not confirmed',
}

export const HISTORY_LABELS: Record<CorrectionHistoryAction, string> = {
  reported: 'Reported',
  investigation_started: 'Investigation started',
  findings_recorded: 'Findings recorded',
  published: 'Correction published',
  dismissed: 'Dismissed',
}
