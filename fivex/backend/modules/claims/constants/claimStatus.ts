// A claim record carries two separate pieces of state. Mixing them is what made "In Review" and "Disputed"
// look like siblings when one is a step in the work and the other is the outcome of it.
//
//   workflowStatus   where the verification task stands: has anyone started, is it with someone, is it done.
//   assessmentStatus what was concluded about the claim. 'none' until a reviewer reaches a conclusion.
//
// Invariant: a claim is 'completed' exactly when it has an assessment.

export const WORKFLOW_STATUSES = ['unreviewed', 'in_review', 'returned', 'escalated', 'completed'] as const
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number]

export const ASSESSMENT_STATUSES = [
  'none',
  'verified',
  'partially_supported',
  'disputed',
  'unverified',
  'unable_to_verify',
] as const
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number]

// Every assessment a reviewer can actually reach. 'unverified' and 'unable_to_verify' are legitimate outcomes:
// not being able to confirm a claim is not the same as having shown it false.
export const CONCLUDING_ASSESSMENTS = ASSESSMENT_STATUSES.filter(
  (status): status is Exclude<AssessmentStatus, 'none'> => status !== 'none',
)
export type ConcludingAssessment = (typeof CONCLUDING_ASSESSMENTS)[number]

// The single combined status the editor's oversight page has always used. It is derived from the two fields
// above and never stored, so it can't drift out of step with them.
export const CLAIM_STATUSES = [
  'unreviewed',
  'in_review',
  'verified',
  'partially_supported',
  'disputed',
  'unverified',
  'unable_to_verify',
] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

export function legacyStatus(workflow: WorkflowStatus, assessment: AssessmentStatus): ClaimStatus {
  if (workflow === 'completed' && assessment !== 'none') return assessment
  return workflow === 'unreviewed' ? 'unreviewed' : 'in_review'
}

export function fromLegacyStatus(status: ClaimStatus): {
  workflowStatus: WorkflowStatus
  assessmentStatus: AssessmentStatus
} {
  if (status === 'unreviewed' || status === 'in_review') {
    return { workflowStatus: status, assessmentStatus: 'none' }
  }
  return { workflowStatus: 'completed', assessmentStatus: status }
}

export const isOpenWorkflow = (workflow: WorkflowStatus): boolean => workflow !== 'completed'

export const CLAIM_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const
export type ClaimPriority = (typeof CLAIM_PRIORITIES)[number]

export const PRIORITY_RANK: Record<ClaimPriority, number> = { low: 0, normal: 1, high: 2, urgent: 3 }

export const EVIDENCE_STATUSES = ['none', 'gathering', 'sufficient', 'insufficient', 'conflicting'] as const
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number]

export const EVIDENCE_STANCES = ['supporting', 'contradicting', 'context'] as const
export type EvidenceStance = (typeof EVIDENCE_STANCES)[number]

export const SOURCE_RELIABILITIES = ['high', 'medium', 'low', 'unknown'] as const
export type SourceReliability = (typeof SOURCE_RELIABILITIES)[number]

export const ESCALATION_KINDS = ['conflict_of_interest', 'policy_violation', 'other'] as const
export type EscalationKind = (typeof ESCALATION_KINDS)[number]

// What the queue shows in its Evidence column.
export const EVIDENCE_STATES = ['missing', 'incomplete', 'attached'] as const
export type EvidenceState = (typeof EVIDENCE_STATES)[number]

const THIN_EVIDENCE: readonly EvidenceStatus[] = ['none', 'gathering', 'insufficient']

// Missing: nothing is attached at all. Incomplete: something is attached, but an admin flagged it or the
// reviewer says it isn't enough yet. Attached: there is material and nobody says it falls short.
// A reviewer marking evidence "Sufficient" with nothing attached still reads as missing, on purpose.
// The queue's evidence filter applies this same rule in the database (see adminClaim.repository).
export function deriveEvidenceState(input: {
  itemCount: number
  sourceCount: number
  evidenceStatus: EvidenceStatus
  flagged: boolean
}): EvidenceState {
  if (input.itemCount === 0 && input.sourceCount === 0) return 'missing'
  if (input.flagged || THIN_EVIDENCE.includes(input.evidenceStatus)) return 'incomplete'
  return 'attached'
}

export const THIN_EVIDENCE_STATUSES = THIN_EVIDENCE

// The preset lists the overview's metric cards open. The same definitions produce each card's count and the
// list it opens, so a number on a card always equals the length of the list behind it.
export const FACT_CHECK_VIEWS = [
  'all',
  'pending',
  'in_progress',
  'disputed',
  'unresolved',
  'overdue',
  'completed_recently',
  'escalated',
  'returned',
  'evidence_flagged',
  'unassigned',
] as const
export type FactCheckView = (typeof FACT_CHECK_VIEWS)[number]

export const RECENT_DAYS = 7
