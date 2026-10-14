import {
  ArrowRight,
  CheckCircle2,
  EyeOff,
  FilePlus,
  Globe,
  Pencil,
  RotateCcw,
  Send,
  Trash2,
  Undo2,
  type LucideIcon,
} from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { getErrorMessage } from '@/lib/getErrorMessage'
import type { AdminAuditEntry, AdminAuditTrail, AuditAction } from '../types/adminArticle.types'
import { AUDIT_ACTION_LABELS, FIELD_LABELS, ROLE_LABELS, STATUS_LABELS } from '../utils/articleLabels'

const ICONS: Record<AuditAction, LucideIcon> = {
  created: FilePlus,
  edited: Pencil,
  submitted: Send,
  withdrawn: Undo2,
  approved: CheckCircle2,
  changes_requested: RotateCcw,
  published: Globe,
  unpublished: EyeOff,
  status_changed: ArrowRight,
  deleted: Trash2,
}

const TONE: Partial<Record<AuditAction, string>> = {
  approved: 'bg-verified/10 text-verified',
  published: 'bg-verified/10 text-verified',
  changes_requested: 'bg-pending/10 text-pending',
  unpublished: 'bg-disputed/10 text-disputed',
  deleted: 'bg-disputed/10 text-disputed',
}

function Entry({ entry }: { entry: AdminAuditEntry }) {
  const Icon = ICONS[entry.action]
  const when = dayjs(entry.createdAt)
  const fields = entry.changedFields.map((field) => FIELD_LABELS[field] ?? field)

  return (
    <li className="flex gap-3">
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE[entry.action] ?? 'bg-accent-bg text-accent'}`}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1 pb-5 border-b border-card-border last:border-0 last:pb-0">
        <p className="text-sm text-card-text">
          <span className="font-medium text-card-heading">{entry.actor.name}</span>{' '}
          <span className="text-xs text-card-text-dim">({ROLE_LABELS[entry.actor.role] ?? entry.actor.role})</span>{' '}
          {AUDIT_ACTION_LABELS[entry.action]}
        </p>

        {entry.fromStatus && entry.toStatus && (
          <p className="mt-1 text-xs text-card-text-muted">
            {STATUS_LABELS[entry.fromStatus]} → {STATUS_LABELS[entry.toStatus]}
          </p>
        )}
        {!entry.fromStatus && entry.toStatus && (
          <p className="mt-1 text-xs text-card-text-muted">Started as {STATUS_LABELS[entry.toStatus].toLowerCase()}</p>
        )}

        {fields.length > 0 && <p className="mt-1 text-xs text-card-text-muted">Changed: {fields.join(', ')}</p>}

        {entry.note && (
          <blockquote className="mt-2 whitespace-pre-line break-words border-l-2 border-accent-border pl-3 text-sm text-card-text">
            {entry.note}
          </blockquote>
        )}

        <time dateTime={entry.createdAt} title={when.format('dddd, MMM D, YYYY h:mm:ss A')} className="mt-1.5 block text-xs text-card-text-dim">
          {when.format('MMM D, YYYY h:mm A')} · {when.fromNow()}
        </time>
      </div>
    </li>
  )
}

interface ArticleAuditHistoryProps {
  trail: AdminAuditTrail | undefined
  isLoading: boolean
  error: unknown
}

export function ArticleAuditHistory({ trail, isLoading, error }: ArticleAuditHistoryProps) {
  return (
    <section aria-labelledby="audit-heading" className="rounded-2xl border border-card-border bg-card p-5">
      <h2 id="audit-heading" className="text-sm font-semibold text-card-heading mb-4">
        Audit history
      </h2>

      {isLoading && <p className="text-sm text-card-text-muted">Loading history…</p>}
      {error != null && !trail && (
        <p role="alert" className="text-sm text-disputed">
          {getErrorMessage(error, 'Failed to load the history.')}
        </p>
      )}

      {trail && trail.entries.length === 0 && (
        <p className="text-sm text-card-text-muted">
          Nothing has been recorded for this article yet. Activity from before history was kept doesn’t appear here.
        </p>
      )}

      {trail && trail.entries.length > 0 && (
        <>
          <ol className="flex flex-col gap-5">
            {trail.entries.map((entry) => (
              <Entry key={entry.id} entry={entry} />
            ))}
          </ol>
          {trail.total > trail.entries.length && (
            <p className="mt-4 text-xs text-card-text-muted">
              Showing the latest {trail.entries.length} of {trail.total} entries.
            </p>
          )}
        </>
      )}
    </section>
  )
}
