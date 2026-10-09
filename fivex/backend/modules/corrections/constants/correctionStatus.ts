export const CORRECTION_STATUSES = {
  QUEUED: 'queued',
  INVESTIGATING: 'investigating',
  PUBLISHED: 'published',
  // Looked into and found not to need a correction; kept for the record.
  DISMISSED: 'dismissed',
} as const

export type CorrectionStatus = (typeof CORRECTION_STATUSES)[keyof typeof CORRECTION_STATUSES]

export const ALL_CORRECTION_STATUSES: CorrectionStatus[] = Object.values(CORRECTION_STATUSES)

export const CORRECTION_CATEGORIES = [
  'factual-error',
  'misattribution',
  'outdated-information',
  'typo',
  'other',
] as const

export type CorrectionCategory = (typeof CORRECTION_CATEGORIES)[number]

export const INVESTIGATION_VERDICTS = ['confirmed', 'partially-confirmed', 'not-confirmed'] as const

export type InvestigationVerdict = (typeof INVESTIGATION_VERDICTS)[number]

export const CORRECTION_HISTORY_ACTIONS = [
  'reported',
  'investigation_started',
  'findings_recorded',
  'published',
  'dismissed',
] as const

export type CorrectionHistoryAction = (typeof CORRECTION_HISTORY_ACTIONS)[number]
