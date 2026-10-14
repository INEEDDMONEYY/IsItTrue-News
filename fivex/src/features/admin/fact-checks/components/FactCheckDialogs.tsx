import { useState } from 'react'
import { AdminActionDialog } from '../../components/AdminActionDialog'
import { factChecksApi } from '../api/factChecks.api'
import { useFactCheckAction, useInvestigationOptions, useReviewers } from '../hooks/useAdminFactChecks'
import type {
  ActionDialog,
  ClaimPriority,
  ConcludingAssessment,
  EscalationKind,
  FactCheckRecord,
  MetadataInput,
  RevisionInput,
} from '../types/factCheck.types'
import {
  ASSESSMENT_LABELS,
  ESCALATION_LABELS,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  ROLE_LABELS,
} from '../utils/factCheckLabels'
import { VerdictSelector } from './VerdictSelector'

interface DialogProps {
  record: FactCheckRecord
  onClose: () => void
  // Called with a sentence describing what was done, once the server has accepted it.
  onDone: (message: string) => void
}

const SELECT =
  'w-full rounded-xl border border-card-border bg-bg px-3.5 py-2.5 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent-border'
const TEXTAREA = `${SELECT} resize-none`

function Labelled({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-card-text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-card-text-dim">{hint}</p>}
    </div>
  )
}

// A dialog that only needs a reason (or a note) and one request.
function NoteDialog({
  record,
  onClose,
  onDone,
  title,
  description,
  confirmLabel,
  noteLabel,
  required,
  tone,
  doneMessage,
  run,
}: DialogProps & {
  title: string
  description: string
  confirmLabel: string
  noteLabel: string
  required: boolean
  tone?: 'default' | 'danger'
  doneMessage: string
  run: (id: string, note: string) => Promise<FactCheckRecord>
}) {
  const action = useFactCheckAction(record.id)
  return (
    <AdminActionDialog
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      tone={tone}
      note={{ label: noteLabel, required, maxLength: 2000 }}
      isPending={action.isPending}
      error={action.error}
      onConfirm={(note) =>
        action.mutate(() => run(record.id, note), {
          onSuccess: () => {
            onDone(doneMessage)
            onClose()
          },
        })
      }
      onCancel={onClose}
    />
  )
}

function AssignDialog({ record, onClose, onDone }: DialogProps) {
  const action = useFactCheckAction(record.id)
  const { data: reviewers = [], isLoading, error } = useReviewers()
  const [reviewerId, setReviewerId] = useState('')
  const current = record.task.assignee

  return (
    <AdminActionDialog
      title={current ? 'Reassign this fact-check' : 'Assign a reviewer'}
      description="The person you pick becomes responsible from now on and is notified. Anyone already responsible is told too. This never changes who is credited for a conclusion already recorded."
      confirmLabel={current ? 'Reassign' : 'Assign'}
      canConfirm={Boolean(reviewerId) && reviewerId !== current?.id}
      note={{ label: 'Note for the history', required: false, maxLength: 500 }}
      isPending={action.isPending}
      error={action.error ?? error}
      onConfirm={(note) =>
        action.mutate(() => factChecksApi.assign(record.id, reviewerId, note || undefined), {
          onSuccess: () => {
            onDone('Reviewer assigned.')
            onClose()
          },
        })
      }
      onCancel={onClose}
    >
      <Labelled label="Reviewer" htmlFor="assign-reviewer">
        <select id="assign-reviewer" value={reviewerId} onChange={(event) => setReviewerId(event.target.value)} className={SELECT}>
          <option value="">{isLoading ? 'Loading…' : 'Choose a reviewer'}</option>
          {reviewers.map((reviewer) => (
            <option key={reviewer.id} value={reviewer.id} disabled={reviewer.id === current?.id}>
              {reviewer.name} ({ROLE_LABELS[reviewer.role] ?? reviewer.role}){reviewer.id === current?.id ? ' — current' : ''}
            </option>
          ))}
        </select>
      </Labelled>
    </AdminActionDialog>
  )
}

function EscalateDialog({ record, onClose, onDone }: DialogProps) {
  const action = useFactCheckAction(record.id)
  const [kind, setKind] = useState<EscalationKind>('conflict_of_interest')
  return (
    <AdminActionDialog
      title="Escalate this record"
      description="Puts the record on hold for everyone, including its reviewer, until an admin resolves it. Any conclusion it holds is withdrawn and kept in the history. The reviewer is not notified."
      confirmLabel="Escalate"
      tone="danger"
      note={{ label: 'What is the concern?', required: true, maxLength: 2000 }}
      isPending={action.isPending}
      error={action.error}
      onConfirm={(note) =>
        action.mutate(() => factChecksApi.escalate(record.id, kind, note), {
          onSuccess: () => {
            onDone('Record escalated and put on hold.')
            onClose()
          },
        })
      }
      onCancel={onClose}
    >
      <Labelled label="Kind of concern" htmlFor="escalate-kind">
        <select id="escalate-kind" value={kind} onChange={(event) => setKind(event.target.value as EscalationKind)} className={SELECT}>
          {(Object.keys(ESCALATION_LABELS) as EscalationKind[]).map((option) => (
            <option key={option} value={option}>
              {ESCALATION_LABELS[option]}
            </option>
          ))}
        </select>
      </Labelled>
    </AdminActionDialog>
  )
}

// Changing a recorded conclusion. It asks for a reason, and says up front that the current one is kept.
function ReviseDialog({ record, onClose, onDone }: DialogProps) {
  const action = useFactCheckAction(record.id)
  const current = record.assessment
  const [status, setStatus] = useState<ConcludingAssessment>(current?.status ?? 'unverified')
  const [conclusion, setConclusion] = useState(current?.conclusion ?? '')
  const [reasoning, setReasoning] = useState(current?.reasoning ?? '')
  const [limitations, setLimitations] = useState(current?.limitations ?? '')
  const [uncertainty, setUncertainty] = useState(current?.uncertainty ?? '')

  const narrative = { conclusion, reasoning, limitations, uncertainty }
  const original = {
    conclusion: current?.conclusion ?? '',
    reasoning: current?.reasoning ?? '',
    limitations: current?.limitations ?? '',
    uncertainty: current?.uncertainty ?? '',
  }
  const changedNarrative = (Object.keys(narrative) as (keyof typeof narrative)[]).filter((key) => narrative[key].trim() !== original[key])
  const changed = status !== current?.status || changedNarrative.length > 0

  const setters = { conclusion: setConclusion, reasoning: setReasoning, limitations: setLimitations, uncertainty: setUncertainty }
  const labels = { conclusion: 'Conclusion', reasoning: 'Reasoning', limitations: 'Limitations', uncertainty: 'Remaining uncertainty' }

  return (
    <AdminActionDialog
      wide
      title="Revise this conclusion"
      description={`The conclusion now recorded (${current ? ASSESSMENT_LABELS[current.status] : 'none'}${current?.decidedBy ? `, by ${current.decidedBy.name}` : ''}) is kept in full in the history. The fact-checker is told, and the article's fact-checked mark is cleared so an editor re-confirms it.`}
      confirmLabel="Revise conclusion"
      canConfirm={changed}
      note={{ label: 'Why is this being changed?', required: true, maxLength: 1000 }}
      isPending={action.isPending}
      error={action.error}
      onConfirm={(reason) => {
        const input: RevisionInput = { assessmentStatus: status, reason }
        // Only what was edited is sent; anything left alone keeps its current wording.
        for (const key of changedNarrative) input[key] = narrative[key].trim()
        action.mutate(() => factChecksApi.reviseAssessment(record.id, input), {
          onSuccess: () => {
            onDone('Conclusion revised. The previous one is kept in the history.')
            onClose()
          },
        })
      }}
      onCancel={onClose}
    >
      <VerdictSelector
        value={status}
        onChange={setStatus}
        unavailable={record.evidence.status === 'sufficient' ? {} : { verified: 'Needs the evidence status to be Sufficient first.' }}
      />
      {(Object.keys(narrative) as (keyof typeof narrative)[]).map((key) => (
        <Labelled key={key} label={labels[key]} htmlFor={`revise-${key}`}>
          <textarea
            id={`revise-${key}`}
            rows={key === 'reasoning' ? 4 : 2}
            value={narrative[key]}
            maxLength={key === 'reasoning' ? 4000 : key === 'conclusion' ? 1000 : 2000}
            onChange={(event) => setters[key](event.target.value)}
            className={TEXTAREA}
          />
        </Labelled>
      ))}
    </AdminActionDialog>
  )
}

function MetadataDialog({ record, onClose, onDone }: DialogProps) {
  const action = useFactCheckAction(record.id)
  const { task, claim } = record
  const currentDue = task.dueAt ? task.dueAt.slice(0, 10) : ''
  const [priority, setPriority] = useState<ClaimPriority>(task.priority)
  const [dueAt, setDueAt] = useState(currentDue)
  const [context, setContext] = useState(claim.context ?? '')
  const [checkReason, setCheckReason] = useState(claim.checkReason ?? '')

  const changes: MetadataInput = {}
  if (priority !== task.priority) changes.priority = priority
  if (dueAt !== currentDue) changes.dueAt = dueAt || null
  if (context.trim() !== (claim.context ?? '')) changes.context = context.trim()
  if (checkReason.trim() !== (claim.checkReason ?? '')) changes.checkReason = checkReason.trim()
  const changed = Object.keys(changes).length > 0

  return (
    <AdminActionDialog
      title="Correct record details"
      description="Administrative details only: this can't change the claim's wording, its evidence or its conclusion."
      confirmLabel="Save changes"
      canConfirm={changed}
      note={{ label: 'Note for the history', required: false, maxLength: 500 }}
      isPending={action.isPending}
      error={action.error}
      onConfirm={(note) =>
        action.mutate(() => factChecksApi.correctMetadata(record.id, { ...changes, ...(note ? { note } : {}) }), {
          onSuccess: () => {
            onDone('Record details updated.')
            onClose()
          },
        })
      }
      onCancel={onClose}
    >
      <Labelled label="Priority" htmlFor="meta-priority">
        <select id="meta-priority" value={priority} onChange={(event) => setPriority(event.target.value as ClaimPriority)} className={SELECT}>
          {PRIORITY_ORDER.map((option) => (
            <option key={option} value={option}>
              {PRIORITY_LABELS[option]}
            </option>
          ))}
        </select>
      </Labelled>
      <Labelled label="Deadline" htmlFor="meta-due" hint="A whole day. The record isn't overdue until that day has ended (UTC). Clear the field to remove the deadline.">
        <input id="meta-due" type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className={SELECT} />
      </Labelled>
      <Labelled label="Context" htmlFor="meta-context">
        <textarea id="meta-context" rows={2} maxLength={1000} value={context} onChange={(event) => setContext(event.target.value)} className={TEXTAREA} />
      </Labelled>
      <Labelled label="Why it is being checked" htmlFor="meta-reason">
        <textarea id="meta-reason" rows={2} maxLength={500} value={checkReason} onChange={(event) => setCheckReason(event.target.value)} className={TEXTAREA} />
      </Labelled>
    </AdminActionDialog>
  )
}

function InvestigationDialog({ record, onClose, onDone }: DialogProps) {
  const action = useFactCheckAction(record.id)
  const { data: options = [], isLoading, error } = useInvestigationOptions(true)
  const currentId = record.connections.investigation?.id ?? ''
  const [investigationId, setInvestigationId] = useState(currentId)

  return (
    <AdminActionDialog
      title="Link an investigation"
      description="Connects this record to an investigation it relates to, or removes the link."
      confirmLabel="Save link"
      canConfirm={investigationId !== currentId}
      isPending={action.isPending}
      error={action.error ?? error}
      onConfirm={() =>
        action.mutate(() => factChecksApi.linkInvestigation(record.id, investigationId || null), {
          onSuccess: () => {
            onDone(investigationId ? 'Investigation linked.' : 'Investigation link removed.')
            onClose()
          },
        })
      }
      onCancel={onClose}
    >
      <Labelled label="Investigation" htmlFor="link-investigation">
        <select id="link-investigation" value={investigationId} onChange={(event) => setInvestigationId(event.target.value)} className={SELECT}>
          <option value="">{isLoading ? 'Loading…' : 'No investigation'}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.title} ({option.status})
            </option>
          ))}
        </select>
      </Labelled>
    </AdminActionDialog>
  )
}

// Renders the dialog for whichever action was chosen. Each is mounted fresh when opened, so one dialog's
// half-typed text or error never carries over into the next.
export function FactCheckDialogs({ record, dialog, onClose, onDone }: DialogProps & { dialog: ActionDialog | null }) {
  if (!dialog) return null
  const shared = { record, onClose, onDone }

  switch (dialog.kind) {
    case 'assign':
      return <AssignDialog {...shared} />
    case 'escalate':
      return <EscalateDialog {...shared} />
    case 'revise':
      return <ReviseDialog {...shared} />
    case 'metadata':
      return <MetadataDialog {...shared} />
    case 'investigation':
      return <InvestigationDialog {...shared} />
    case 'unassign':
      return (
        <NoteDialog {...shared} title="Remove the reviewer?" description="Nobody will be responsible until someone is assigned. A claim that was mid-review goes back to the queue, and the reviewer is told." confirmLabel="Remove reviewer" noteLabel="Reason" required doneMessage="Reviewer removed." run={factChecksApi.unassign} />
      )
    case 'return':
      return (
        <NoteDialog {...shared} title="Return for further review?" description="The record goes back to its reviewer, who sees your reason. Any conclusion it holds is withdrawn from the record and kept in the history, and the article's fact-checked mark is cleared." confirmLabel="Return for review" noteLabel="What needs another look?" required doneMessage="Returned for further review." run={factChecksApi.returnForReview} />
      )
    case 'resolve':
      return (
        <NoteDialog {...shared} title="Resolve the escalation?" description="Lifts the hold. The record goes back to its reviewer, or to the queue if nobody is assigned." confirmLabel="Resolve" noteLabel="How was it resolved?" required doneMessage="Escalation resolved." run={factChecksApi.resolveEscalation} />
      )
    case 'flag':
      return (
        <NoteDialog {...shared} title="Flag the evidence as incomplete?" description="The record is marked as having incomplete evidence, and its reviewer sees what you say is missing." confirmLabel="Flag evidence" noteLabel="What is missing or incomplete?" required doneMessage="Evidence flagged." run={factChecksApi.flagEvidence} />
      )
    case 'clearFlag':
      return (
        <NoteDialog {...shared} title="Clear the evidence flag?" description="Marks the evidence concern as dealt with." confirmLabel="Clear flag" noteLabel="Note" required={false} doneMessage="Evidence flag cleared." run={factChecksApi.clearEvidenceFlag} />
      )
    case 'comment':
      return (
        <NoteDialog {...shared} title="Add a comment" description="Recorded in the history. It doesn't change the record or notify anyone." confirmLabel="Add comment" noteLabel="Comment" required doneMessage="Comment added." run={factChecksApi.comment} />
      )
    case 'restrict': {
      const restricting = !dialog.item.restricted
      return (
        <NoteDialog
          key={dialog.item.id}
          {...shared}
          title={restricting ? 'Restrict this evidence?' : 'Lift the restriction?'}
          description={
            restricting
              ? 'Only admins will be able to see it. Editors, including the reviewer, will see a placeholder instead.'
              : 'Editors, including the reviewer, will be able to see it again.'
          }
          confirmLabel={restricting ? 'Restrict' : 'Lift restriction'}
          noteLabel="Reason"
          required
          doneMessage={restricting ? 'Evidence restricted.' : 'Restriction lifted.'}
          run={(id, reason) => factChecksApi.setEvidenceRestriction(id, dialog.item.id, restricting, reason)}
        />
      )
    }
  }
}
