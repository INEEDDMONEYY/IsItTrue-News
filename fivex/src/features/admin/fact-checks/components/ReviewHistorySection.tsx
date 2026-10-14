import {
  ArrowRight,
  CheckCircle2,
  Flag,
  FlagOff,
  Link2,
  Lock,
  LockOpen,
  MessageSquare,
  Pencil,
  Plus,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useFactCheckHistory } from '../hooks/useAdminFactChecks'
import type { ActionDialog, HistoryAction, HistoryEntry, PreviousAssessment } from '../types/factCheck.types'
import {
  ASSESSMENT_LABELS,
  FIELD_LABELS,
  HISTORY_LABELS,
  ROLE_LABELS,
  WORKFLOW_LABELS,
} from '../utils/factCheckLabels'
import { RecordSection } from './RecordSection'

const ICONS: Record<HistoryAction, LucideIcon> = {
  created: Plus,
  assigned: UserPlus,
  reassigned: Users,
  unassigned: UserMinus,
  workflow_changed: ArrowRight,
  assessment_recorded: CheckCircle2,
  assessment_revised: Pencil,
  returned: RotateCcw,
  escalated: ShieldAlert,
  escalation_resolved: ShieldCheck,
  evidence_updated: Pencil,
  evidence_added: Plus,
  evidence_removed: Trash2,
  evidence_flagged: Flag,
  evidence_flag_cleared: FlagOff,
  evidence_restricted: Lock,
  evidence_unrestricted: LockOpen,
  metadata_corrected: Pencil,
  investigation_linked: Link2,
  comment: MessageSquare,
  deleted: Trash2,
}

const TONE: Partial<Record<HistoryAction, string>> = {
  assessment_recorded: 'bg-verified/10 text-verified',
  returned: 'bg-pending/10 text-pending',
  evidence_flagged: 'bg-pending/10 text-pending',
  escalated: 'bg-disputed/10 text-disputed',
  deleted: 'bg-disputed/10 text-disputed',
}

const when = (value: string | null) => (value ? dayjs(value).format('MMM D, YYYY h:mm A') : null)

// A conclusion as it stood before it was changed. It stays readable in full, with who made it and when.
export function PreviousAssessmentView({ previous, label = 'Previous assessment' }: { previous: PreviousAssessment; label?: string }) {
  const parts: [string, string | null][] = [
    ['Conclusion', previous.conclusion],
    ['Reasoning', previous.reasoning],
    ['Limitations', previous.limitations],
    ['Remaining uncertainty', previous.uncertainty],
  ]
  return (
    <details className="mt-2 rounded-xl border border-card-border bg-card-2 p-3 text-sm">
      <summary className="cursor-pointer text-xs font-medium text-card-text">
        {label}: {ASSESSMENT_LABELS[previous.status]}
        {previous.decidedByName ? ` · ${previous.decidedByName}` : ''}
        {previous.decidedAt ? ` · ${dayjs(previous.decidedAt).format('MMM D, YYYY')}` : ''}
      </summary>
      <dl className="mt-2 flex flex-col gap-2">
        {parts.map(([name, text]) => (
          <div key={name}>
            <dt className="text-xs text-card-text-dim">{name}</dt>
            <dd className="whitespace-pre-line break-words text-card-text">{text ?? <span className="italic text-card-text-dim">None recorded</span>}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}

function Entry({ entry }: { entry: HistoryEntry }) {
  const Icon = ICONS[entry.action]
  const workflowMoved = entry.fromWorkflow && entry.toWorkflow && entry.fromWorkflow !== entry.toWorkflow
  const assessmentMoved = entry.fromAssessment && entry.toAssessment && entry.fromAssessment !== entry.toAssessment
  const fields = entry.changedFields.map((field) => FIELD_LABELS[field] ?? field)

  return (
    <li className="flex gap-3">
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE[entry.action] ?? 'bg-accent-bg text-accent'}`}>
        <Icon className="w-4 h-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 pb-5 border-b border-card-border last:border-0 last:pb-0">
        <p className="text-sm text-card-text">
          <span className="font-medium text-card-heading">{entry.actor.name}</span>{' '}
          <span className="text-xs text-card-text-dim">({ROLE_LABELS[entry.actor.role] ?? entry.actor.role})</span> {HISTORY_LABELS[entry.action]}
        </p>

        {(entry.fromAssignee || entry.toAssignee) && (
          <p className="mt-1 text-xs text-card-text-muted">
            {entry.fromAssignee ? entry.fromAssignee.name : 'Nobody'} → {entry.toAssignee ? entry.toAssignee.name : 'Nobody'}
          </p>
        )}
        {workflowMoved && (
          <p className="mt-1 text-xs text-card-text-muted">
            Workflow: {WORKFLOW_LABELS[entry.fromWorkflow!]} → {WORKFLOW_LABELS[entry.toWorkflow!]}
          </p>
        )}
        {assessmentMoved && (
          <p className="mt-1 text-xs text-card-text-muted">
            Assessment: {ASSESSMENT_LABELS[entry.fromAssessment!]} → {ASSESSMENT_LABELS[entry.toAssessment!]}
          </p>
        )}
        {fields.length > 0 && <p className="mt-1 text-xs text-card-text-muted">Changed: {fields.join(', ')}</p>}

        {entry.note && (
          <blockquote className="mt-2 whitespace-pre-line break-words border-l-2 border-accent-border pl-3 text-sm text-card-text">{entry.note}</blockquote>
        )}
        {entry.previousAssessment && <PreviousAssessmentView previous={entry.previousAssessment} />}

        <time dateTime={entry.createdAt} title={dayjs(entry.createdAt).format('dddd, MMM D, YYYY h:mm:ss A')} className="mt-1.5 block text-xs text-card-text-dim">
          {when(entry.createdAt)} · {dayjs(entry.createdAt).fromNow()}
        </time>
      </div>
    </li>
  )
}

// 3. Everything that has happened to this record, newest first: who was assigned, what was found, what was said,
// and every conclusion that was later replaced. Without `onOpen` it is read-only (a deleted record's history).
export function ReviewHistorySection({ id, onOpen }: { id: string; onOpen?: (dialog: ActionDialog) => void }) {
  const { data, isLoading, error } = useFactCheckHistory(id)

  return (
    <RecordSection
      id="history"
      number={3}
      title="Review history"
      action={
        onOpen && (
          <button
            type="button"
            onClick={() => onOpen({ kind: 'comment' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-card-heading hover:border-accent-border hover:text-accent transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            Add comment
          </button>
        )
      }
    >
      {isLoading && <p className="text-sm text-card-text-muted">Loading history…</p>}
      {error != null && !data && (
        <p role="alert" className="text-sm text-disputed">
          {getErrorMessage(error, 'Failed to load the history.')}
        </p>
      )}
      {data && data.entries.length === 0 && (
        <p className="text-sm text-card-text-muted">Nothing has been recorded yet. Activity from before history was kept doesn’t appear here.</p>
      )}
      {data && data.entries.length > 0 && (
        <>
          <ol className="flex flex-col gap-5">
            {data.entries.map((entry) => (
              <Entry key={entry.id} entry={entry} />
            ))}
          </ol>
          {data.total > data.entries.length && (
            <p className="mt-4 text-xs text-card-text-muted">
              Showing the latest {data.entries.length} of {data.total} entries.
            </p>
          )}
        </>
      )}
    </RecordSection>
  )
}
