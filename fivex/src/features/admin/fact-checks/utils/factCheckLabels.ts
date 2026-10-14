import type {
  AssessmentStatus,
  ClaimPriority,
  ConcludingAssessment,
  EscalationKind,
  EvidenceStance,
  EvidenceState,
  EvidenceStatus,
  FactCheckView,
  HistoryAction,
  SourceReliability,
  WorkflowStatus,
} from '../types/factCheck.types'

export const WORKFLOW_LABELS: Record<WorkflowStatus, string> = {
  unreviewed: 'Unreviewed',
  in_review: 'In review',
  returned: 'Returned for review',
  escalated: 'Escalated',
  completed: 'Completed',
}
export const WORKFLOW_ORDER: WorkflowStatus[] = ['unreviewed', 'in_review', 'returned', 'escalated', 'completed']

export const ASSESSMENT_LABELS: Record<AssessmentStatus, string> = {
  none: 'No conclusion yet',
  verified: 'Verified',
  partially_supported: 'Partially supported',
  disputed: 'Disputed',
  unverified: 'Unverified',
  unable_to_verify: 'Unable to verify',
}
export const ASSESSMENT_ORDER: AssessmentStatus[] = [
  'none',
  'verified',
  'partially_supported',
  'disputed',
  'unverified',
  'unable_to_verify',
]
export const CONCLUDING_ORDER: ConcludingAssessment[] = [
  'verified',
  'partially_supported',
  'disputed',
  'unverified',
  'unable_to_verify',
]

// What each conclusion means, so the person choosing one isn't guessing. Uncertainty is a legitimate result.
export const ASSESSMENT_MEANINGS: Record<ConcludingAssessment, string> = {
  verified: 'The evidence supports the claim.',
  partially_supported: 'Some of the claim holds up, and some does not or is not shown.',
  disputed: 'The evidence contradicts the claim.',
  unverified: 'Not confirmed. This is not a finding that the claim is false.',
  unable_to_verify: 'The evidence needed could not be found or reached. This is not a finding that the claim is false.',
}

// The seven-term vocabulary the editors use: the conclusion once there is one, otherwise how far along the
// work is. Returned and escalated records are still in review, and are shown with their own marker beside it.
export function verificationLabel(workflow: WorkflowStatus, assessment: AssessmentStatus): string {
  if (workflow === 'completed' && assessment !== 'none') return ASSESSMENT_LABELS[assessment]
  return workflow === 'unreviewed' ? 'Unreviewed' : 'In review'
}

export const PRIORITY_LABELS: Record<ClaimPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
}
export const PRIORITY_ORDER: ClaimPriority[] = ['low', 'normal', 'high', 'urgent']

export const EVIDENCE_STATE_LABELS: Record<EvidenceState, string> = {
  missing: 'Missing',
  incomplete: 'Incomplete',
  attached: 'Attached',
}
export const EVIDENCE_STATE_ORDER: EvidenceState[] = ['missing', 'incomplete', 'attached']

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  none: 'No evidence yet',
  gathering: 'Gathering',
  sufficient: 'Sufficient',
  insufficient: 'Insufficient',
  conflicting: 'Conflicting',
}

export const STANCE_LABELS: Record<EvidenceStance, string> = {
  supporting: 'Supporting evidence',
  contradicting: 'Contradicting evidence',
  context: 'Context',
}
export const STANCE_ORDER: EvidenceStance[] = ['supporting', 'contradicting', 'context']

export const RELIABILITY_LABELS: Record<SourceReliability, string> = {
  high: 'High reliability',
  medium: 'Medium reliability',
  low: 'Low reliability',
  unknown: 'Reliability not assessed',
}

export const ESCALATION_LABELS: Record<EscalationKind, string> = {
  conflict_of_interest: 'Conflict of interest',
  policy_violation: 'Policy violation',
  other: 'Other concern',
}

export interface ViewInfo {
  label: string
  hint: string
}

// The metric cards. Each is a filtered list, so the hint says exactly what the list holds.
export const VIEW_INFO: Record<FactCheckView, ViewInfo> = {
  all: { label: 'Total fact-check records', hint: 'Every claim being verified, whatever its state.' },
  pending: { label: 'Pending verification', hint: 'Not started yet.' },
  in_progress: { label: 'In progress', hint: 'A reviewer is working on it.' },
  disputed: { label: 'Disputed claims', hint: 'Reviewed, and the evidence contradicts the claim.' },
  unresolved: {
    label: 'Unresolved claims',
    hint: 'Reviewed without a firm answer: unverified or unable to verify. This is not the same as false.',
  },
  overdue: { label: 'Overdue tasks', hint: 'Past their deadline and still open.' },
  completed_recently: { label: 'Recently completed', hint: 'Concluded in the last 7 days.' },
  escalated: { label: 'Escalated', hint: 'On hold until an admin resolves a conflict or policy concern.' },
  returned: { label: 'Returned for review', hint: 'Sent back to the reviewer for another look.' },
  evidence_flagged: { label: 'Evidence flagged', hint: 'An admin says the evidence is incomplete.' },
  unassigned: { label: 'Unassigned', hint: 'Open, with nobody responsible.' },
}

export const PRIMARY_VIEWS: FactCheckView[] = [
  'all',
  'pending',
  'in_progress',
  'disputed',
  'unresolved',
  'overdue',
  'completed_recently',
]
export const ATTENTION_VIEWS: FactCheckView[] = ['escalated', 'returned', 'evidence_flagged', 'unassigned']
export const ALL_VIEWS: FactCheckView[] = [...PRIMARY_VIEWS, ...ATTENTION_VIEWS]

// What each history entry says the person did.
export const HISTORY_LABELS: Record<HistoryAction, string> = {
  created: 'created this record',
  assigned: 'assigned a reviewer',
  reassigned: 'reassigned the reviewer',
  unassigned: 'removed the reviewer',
  workflow_changed: 'changed the workflow status',
  assessment_recorded: 'recorded a conclusion',
  assessment_revised: 'revised the conclusion',
  returned: 'returned it for further review',
  escalated: 'escalated it',
  escalation_resolved: 'resolved the escalation',
  evidence_updated: 'updated the evidence',
  evidence_added: 'added evidence',
  evidence_removed: 'removed evidence',
  evidence_flagged: 'flagged the evidence as incomplete',
  evidence_flag_cleared: 'cleared the evidence flag',
  evidence_restricted: 'restricted evidence',
  evidence_unrestricted: 'lifted a restriction on evidence',
  metadata_corrected: 'corrected record details',
  investigation_linked: 'changed the linked investigation',
  comment: 'commented',
  deleted: 'deleted the record',
}

export const FIELD_LABELS: Record<string, string> = {
  text: 'Claim',
  evidenceStatus: 'Evidence status',
  evidenceSummary: 'Evidence summary',
  sources: 'Sources',
  priority: 'Priority',
  dueAt: 'Deadline',
  context: 'Context',
  checkReason: 'Reason for checking',
  conclusion: 'Conclusion',
  reasoning: 'Reasoning',
  limitations: 'Limitations',
  uncertainty: 'Remaining uncertainty',
}

export const ROLE_LABELS: Record<string, string> = { admin: 'Admin', editor: 'Editor', author: 'Author' }

// Only web links are turned into links. Anything else (javascript:, data:) is shown as plain text.
export function isSafeWebUrl(value: string | null | undefined): value is string {
  return Boolean(value && /^https?:\/\//i.test(value))
}
