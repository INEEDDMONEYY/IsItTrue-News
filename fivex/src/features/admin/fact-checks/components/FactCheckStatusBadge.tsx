import type {
  AssessmentStatus,
  ClaimPriority,
  EvidenceState,
  WorkflowStatus,
} from '../types/factCheck.types'
import {
  ASSESSMENT_LABELS,
  EVIDENCE_STATE_LABELS,
  PRIORITY_LABELS,
  WORKFLOW_LABELS,
  verificationLabel,
} from '../utils/factCheckLabels'

const BADGE = 'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1'
const NEUTRAL = 'bg-surface-2 text-text-muted ring-border'
const ACCENT = 'bg-accent-bg text-accent ring-accent-border'
const AMBER = 'bg-pending/10 text-pending ring-pending/30'
const GREEN = 'bg-verified/10 text-verified ring-verified/30'
const RED = 'bg-disputed/10 text-disputed ring-disputed/30'

// Red is for a conclusion that the claim is contradicted, and for escalations. Being unable to confirm a claim
// is not the same as having shown it false, so those outcomes are never red.
const ASSESSMENT_STYLES: Record<AssessmentStatus, string> = {
  none: NEUTRAL,
  verified: GREEN,
  partially_supported: ACCENT,
  disputed: RED,
  unverified: AMBER,
  unable_to_verify: NEUTRAL,
}

const WORKFLOW_STYLES: Record<WorkflowStatus, string> = {
  unreviewed: NEUTRAL,
  in_review: ACCENT,
  returned: AMBER,
  escalated: RED,
  completed: GREEN,
}

const EVIDENCE_STYLES: Record<EvidenceState, string> = {
  missing: RED,
  incomplete: AMBER,
  attached: GREEN,
}

const PRIORITY_STYLES: Record<ClaimPriority, string> = {
  low: NEUTRAL,
  normal: NEUTRAL,
  high: AMBER,
  urgent: RED,
}

export function AssessmentBadge({ status }: { status: AssessmentStatus }) {
  return <span className={`${BADGE} ${ASSESSMENT_STYLES[status]}`}>{ASSESSMENT_LABELS[status]}</span>
}

export function WorkflowBadge({ status }: { status: WorkflowStatus }) {
  return <span className={`${BADGE} ${WORKFLOW_STYLES[status]}`}>{WORKFLOW_LABELS[status]}</span>
}

export function EvidenceBadge({ state }: { state: EvidenceState }) {
  return <span className={`${BADGE} ${EVIDENCE_STYLES[state]}`}>{EVIDENCE_STATE_LABELS[state]}</span>
}

export function PriorityBadge({ priority }: { priority: ClaimPriority }) {
  return <span className={`${BADGE} ${PRIORITY_STYLES[priority]}`}>{PRIORITY_LABELS[priority]}</span>
}

// The queue's "Verification status": the conclusion once there is one, otherwise how far along the work is.
// A returned or escalated record is still in review, and says so beside it.
export function VerificationStatus({ workflow, assessment }: { workflow: WorkflowStatus; assessment: AssessmentStatus }) {
  const concluded = workflow === 'completed' && assessment !== 'none'
  const style = concluded ? ASSESSMENT_STYLES[assessment] : workflow === 'unreviewed' ? NEUTRAL : ACCENT
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className={`${BADGE} ${style}`}>{verificationLabel(workflow, assessment)}</span>
      {(workflow === 'returned' || workflow === 'escalated') && (
        <span className={`${BADGE} ${WORKFLOW_STYLES[workflow]}`}>{workflow === 'returned' ? 'Returned' : 'Escalated'}</span>
      )}
    </span>
  )
}
