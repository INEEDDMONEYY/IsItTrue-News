// A claim record keeps two things apart: where the verification TASK stands (workflow) and what was CONCLUDED
// about the claim (assessment). "In review" is the first kind; "Disputed" is the second.
export type WorkflowStatus = 'unreviewed' | 'in_review' | 'returned' | 'escalated' | 'completed'
export type AssessmentStatus =
  | 'none'
  | 'verified'
  | 'partially_supported'
  | 'disputed'
  | 'unverified'
  | 'unable_to_verify'
export type ConcludingAssessment = Exclude<AssessmentStatus, 'none'>
export type ClaimPriority = 'low' | 'normal' | 'high' | 'urgent'
export type EvidenceState = 'missing' | 'incomplete' | 'attached'
export type EvidenceStatus = 'none' | 'gathering' | 'sufficient' | 'insufficient' | 'conflicting'
export type EvidenceStance = 'supporting' | 'contradicting' | 'context'
export type SourceReliability = 'high' | 'medium' | 'low' | 'unknown'
export type EscalationKind = 'conflict_of_interest' | 'policy_violation' | 'other'
export type SortOrder = 'asc' | 'desc'
export type FactCheckSortField = 'updatedAt' | 'createdAt' | 'priority' | 'dueAt'

export type FactCheckView =
  | 'all'
  | 'pending'
  | 'in_progress'
  | 'disputed'
  | 'unresolved'
  | 'overdue'
  | 'completed_recently'
  | 'escalated'
  | 'returned'
  | 'evidence_flagged'
  | 'unassigned'

export interface PersonRef {
  id: string
  name: string
}

export interface FactCheckRow {
  id: string
  claim: string
  article: { id: string; title: string; slug: string; status: string } | null
  assignee: PersonRef | null
  evidence: { state: EvidenceState; status: EvidenceStatus; itemCount: number; sourceCount: number; flagged: boolean }
  workflowStatus: WorkflowStatus
  assessmentStatus: AssessmentStatus
  priority: ClaimPriority
  dueAt: string | null
  overdue: boolean
  escalated: boolean
  createdAt: string
  updatedAt: string
}

export interface FactCheckList {
  records: FactCheckRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  view: FactCheckView
}

export interface FactCheckOverview {
  counts: Record<FactCheckView, number>
  generatedAt: string
}

export interface FactCheckListParams {
  view: FactCheckView
  q?: string
  workflow?: WorkflowStatus
  assessment?: AssessmentStatus
  evidence?: EvidenceState
  priority?: ClaimPriority
  // A reviewer's id, or 'unassigned'.
  assignee?: string
  sort: FactCheckSortField
  order: SortOrder
  page: number
  pageSize: number
}

export interface EvidenceItem {
  id: string
  stance: EvidenceStance
  title: string
  url: string | null
  citation: string | null
  reliability: SourceReliability
  reliabilityNote: string | null
  restricted: boolean
  restrictedBy: PersonRef | null
  restrictedAt: string | null
  addedBy: PersonRef | null
  addedAt: string
}

export interface FactCheckRecord {
  id: string
  createdAt: string
  updatedAt: string
  claim: { text: string; context: string | null; checkReason: string | null; createdBy: PersonRef | null }
  task: {
    workflowStatus: WorkflowStatus
    assignee: (PersonRef & { role: string | null }) | null
    priority: ClaimPriority
    dueAt: string | null
    overdue: boolean
    returnReason: string | null
    escalation: { kind: EscalationKind; reason: string; by: PersonRef | null; at: string } | null
  }
  evidence: {
    state: EvidenceState
    status: EvidenceStatus
    summary: string | null
    sources: string[]
    flag: { reason: string; by: PersonRef | null; at: string } | null
    items: EvidenceItem[]
  }
  // null while the record has no conclusion.
  assessment: {
    status: ConcludingAssessment
    conclusion: string | null
    reasoning: string | null
    limitations: string | null
    uncertainty: string | null
    decidedBy: PersonRef | null
    decidedAt: string | null
  } | null
  connections: {
    article: {
      id: string
      title: string
      slug: string
      status: string
      category: string
      factCheckStatus: string
      publicUrl: string | null
    } | null
    corrections: { id: string; status: string; category: string; summary: string; number: number | null; createdAt: string }[]
    investigation: { id: string; title: string; slug: string; status: string } | null
  }
  actions: {
    unassign: boolean
    returnForReview: boolean
    escalate: boolean
    resolveEscalation: boolean
    flagEvidence: boolean
    clearEvidenceFlag: boolean
    reviseAssessment: boolean
  }
}

export type HistoryAction =
  | 'created'
  | 'assigned'
  | 'reassigned'
  | 'unassigned'
  | 'workflow_changed'
  | 'assessment_recorded'
  | 'assessment_revised'
  | 'returned'
  | 'escalated'
  | 'escalation_resolved'
  | 'evidence_updated'
  | 'evidence_added'
  | 'evidence_removed'
  | 'evidence_flagged'
  | 'evidence_flag_cleared'
  | 'evidence_restricted'
  | 'evidence_unrestricted'
  | 'metadata_corrected'
  | 'investigation_linked'
  | 'comment'
  | 'deleted'

export interface PreviousAssessment {
  status: ConcludingAssessment
  conclusion: string | null
  reasoning: string | null
  limitations: string | null
  uncertainty: string | null
  decidedByName: string | null
  decidedAt: string | null
}

export interface HistoryEntry {
  id: string
  action: HistoryAction
  actor: { id: string; name: string; role: string }
  note: string | null
  fromWorkflow: WorkflowStatus | null
  toWorkflow: WorkflowStatus | null
  fromAssessment: AssessmentStatus | null
  toAssessment: AssessmentStatus | null
  fromAssignee: PersonRef | null
  toAssignee: PersonRef | null
  previousAssessment: PreviousAssessment | null
  changedFields: string[]
  createdAt: string
}

export interface FactCheckHistory {
  entries: HistoryEntry[]
  total: number
}

export interface Reviewer extends PersonRef {
  role: string
}

export interface InvestigationOption {
  id: string
  title: string
  status: string
}

export interface RevisionInput {
  assessmentStatus: ConcludingAssessment
  conclusion?: string
  reasoning?: string
  limitations?: string
  uncertainty?: string
  reason: string
}

export interface MetadataInput {
  priority?: ClaimPriority
  // A calendar day like 2026-03-31, or null to remove the deadline.
  dueAt?: string | null
  context?: string
  checkReason?: string
  note?: string
}

// Which action dialog is open on a record page. The sections and the action panel only say what to open;
// the dialogs themselves live in one place.
export type ActionDialog =
  | { kind: 'assign' }
  | { kind: 'unassign' }
  | { kind: 'return' }
  | { kind: 'escalate' }
  | { kind: 'resolve' }
  | { kind: 'flag' }
  | { kind: 'clearFlag' }
  | { kind: 'restrict'; item: EvidenceItem }
  | { kind: 'revise' }
  | { kind: 'metadata' }
  | { kind: 'comment' }
  | { kind: 'investigation' }
