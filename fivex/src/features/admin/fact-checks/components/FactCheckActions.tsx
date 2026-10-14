import { AlertTriangle, Flag, FlagOff, MessageSquare, Pencil, RotateCcw, ShieldAlert, ShieldCheck, UserMinus, UserPlus, type LucideIcon } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import type { ActionDialog, FactCheckRecord } from '../types/factCheck.types'
import { ESCALATION_LABELS, ROLE_LABELS } from '../utils/factCheckLabels'
import { PriorityBadge, VerificationStatus } from './FactCheckStatusBadge'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-card-border last:border-0">
      <dt className="text-xs text-card-text-dim">{label}</dt>
      <dd className="text-sm text-card-text text-right break-words min-w-0">{children}</dd>
    </div>
  )
}

// Where the verification task stands: who is responsible, how urgent it is, and whether it is on hold.
export function TaskPanel({ record }: { record: FactCheckRecord }) {
  const { task } = record
  return (
    <section aria-labelledby="task-heading" className="rounded-2xl border border-card-border bg-card p-5">
      <h2 id="task-heading" className="text-sm font-semibold text-card-heading mb-2">
        Verification task
      </h2>
      <div className="mb-2">
        <VerificationStatus workflow={task.workflowStatus} assessment={record.assessment?.status ?? 'none'} />
      </div>

      {task.escalation && (
        <div className="my-3 rounded-xl border border-disputed/30 bg-disputed/10 p-3" role="note">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-card-heading">
            <ShieldAlert className="w-4 h-4 text-disputed" aria-hidden="true" />
            Escalated: {ESCALATION_LABELS[task.escalation.kind]}
          </p>
          <p className="mt-1 text-sm text-card-text whitespace-pre-line break-words">{task.escalation.reason}</p>
          <p className="mt-1 text-xs text-card-text-dim">
            {task.escalation.by?.name ?? 'An admin'}, {dayjs(task.escalation.at).format('MMM D, YYYY')}. Nobody can edit this record until it is resolved.
          </p>
        </div>
      )}

      {task.returnReason && (
        <div className="my-3 rounded-xl border border-pending/30 bg-pending/10 p-3" role="note">
          <p className="text-sm font-medium text-card-heading">Returned for further review</p>
          <p className="mt-1 text-sm text-card-text whitespace-pre-line break-words">{task.returnReason}</p>
        </div>
      )}

      <dl>
        <Row label="Responsible">
          {task.assignee ? (
            <>
              {task.assignee.name}
              {task.assignee.role && <span className="text-xs text-card-text-dim"> ({ROLE_LABELS[task.assignee.role] ?? task.assignee.role})</span>}
            </>
          ) : (
            <span className="italic text-pending">Nobody</span>
          )}
        </Row>
        <Row label="Priority">
          <PriorityBadge priority={task.priority} />
        </Row>
        <Row label="Deadline">
          {task.dueAt ? (
            <span className={task.overdue ? 'font-medium text-disputed' : ''}>
              {task.overdue && <AlertTriangle className="mr-1 inline w-3.5 h-3.5" aria-hidden="true" />}
              {dayjs(task.dueAt).format('MMM D, YYYY')}
              {task.overdue ? ' (overdue)' : ''}
            </span>
          ) : (
            '—'
          )}
        </Row>
        <Row label="Last updated">{dayjs(record.updatedAt).fromNow()}</Row>
      </dl>
    </section>
  )
}

function ActionButton({ icon: Icon, label, onClick, danger = false }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`w-full inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
          danger
            ? 'border-card-border text-card-heading hover:border-disputed hover:text-disputed'
            : 'border-card-border text-card-heading hover:border-accent-border hover:text-accent'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        {label}
      </button>
    </li>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-card-text-muted">{title}</h3>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  )
}

interface FactCheckActionsProps {
  record: FactCheckRecord
  onOpen: (dialog: ActionDialog) => void
  // The result of the last action, shown here so it is announced and visible next to the buttons.
  message: string | null
}

// What an admin can do. The server says which moves are valid for the record's current state, and only those
// are offered. None of them can write a conclusion for an open record or overwrite one without a reason.
export function FactCheckActions({ record, onOpen, message }: FactCheckActionsProps) {
  const { actions, task } = record
  return (
    <section aria-label="Admin actions" className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-sm font-semibold text-card-heading">Manage</h2>

      <Group title="Assignment">
        <ActionButton icon={UserPlus} label={task.assignee ? 'Reassign reviewer' : 'Assign reviewer'} onClick={() => onOpen({ kind: 'assign' })} />
        {actions.unassign && <ActionButton icon={UserMinus} label="Remove reviewer" onClick={() => onOpen({ kind: 'unassign' })} />}
      </Group>

      <Group title="Review">
        {actions.returnForReview && <ActionButton icon={RotateCcw} label="Return for further review" onClick={() => onOpen({ kind: 'return' })} />}
        {actions.escalate && <ActionButton icon={ShieldAlert} label="Escalate a concern" danger onClick={() => onOpen({ kind: 'escalate' })} />}
        {actions.resolveEscalation && <ActionButton icon={ShieldCheck} label="Resolve escalation" onClick={() => onOpen({ kind: 'resolve' })} />}
        {actions.reviseAssessment && <ActionButton icon={Pencil} label="Revise conclusion" onClick={() => onOpen({ kind: 'revise' })} />}
      </Group>

      <Group title="Evidence">
        {actions.flagEvidence && <ActionButton icon={Flag} label="Flag incomplete evidence" onClick={() => onOpen({ kind: 'flag' })} />}
        {actions.clearEvidenceFlag && <ActionButton icon={FlagOff} label="Clear evidence flag" onClick={() => onOpen({ kind: 'clearFlag' })} />}
      </Group>

      <Group title="Record">
        <ActionButton icon={Pencil} label="Correct priority or details" onClick={() => onOpen({ kind: 'metadata' })} />
        <ActionButton icon={MessageSquare} label="Add comment" onClick={() => onOpen({ kind: 'comment' })} />
      </Group>

      <p className="text-xs text-card-text-dim">
        A conclusion can&apos;t be changed without a reason, and the previous one is always kept in the history.
      </p>

      {message && (
        <p role="status" className="text-sm text-verified">
          {message}
        </p>
      )}
    </section>
  )
}
