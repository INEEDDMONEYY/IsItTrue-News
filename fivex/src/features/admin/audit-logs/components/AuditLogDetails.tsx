
import {
  Activity,
  CalendarDays,
  Check,
  Copy,
  Globe2,
  Hash,
  MapPin,
  Monitor,
  Shield,
  X,
} from 'lucide-react'

import type { AuditLogEvent } from '../types/auditLog.types'

interface AuditLogDetailsProps {
  log: AuditLogEvent | null
  onClose: () => void
}

const severityStyles = {
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  critical: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

const outcomeStyles = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  failure: 'bg-red-500/10 text-red-600 dark:text-red-400',
  blocked: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'medium',
  }).format(date)
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'Not set'
  if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 py-3 sm:flex-row sm:justify-between sm:gap-5">
      <span className="shrink-0 text-xs font-medium text-text-muted">
        {label}
      </span>
      <div className="min-w-0 text-sm text-text sm:max-w-[65%] sm:text-right">
        {children}
      </div>
    </div>
  )
}

function SectionHeading({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-text">
      {children}
    </h3>
  )
}

export function AuditLogDetails({
  log,
  onClose,
}: AuditLogDetailsProps) {
  if (!log) return null

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard access may be unavailable in insecure contexts.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-details-title"
        className="flex h-full w-full max-w-2xl flex-col border-l border-border bg-surface shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-7">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-muted">
              <Activity size={14} />
              Audit event details
            </div>
            <h2
              id="audit-details-title"
              className="text-lg font-bold text-text sm:text-xl"
            >
              {log.action}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Complete record of this platform activity.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close event details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:bg-surface-secondary hover:text-text"
          >
            <X size={17} />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
          <section>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${severityStyles[log.severity]}`}
              >
                {log.severity} severity
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${outcomeStyles[log.outcome]}`}
              >
                {log.outcome}
              </span>

              <span className="rounded-full bg-surface-secondary px-3 py-1.5 text-xs font-semibold capitalize text-text-muted">
                {log.category.replaceAll('-', ' ')}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              {log.description}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface-secondary/40 p-4">
            <SectionHeading>
              <Shield size={16} />
              Event information
            </SectionHeading>

            <div className="divide-y divide-border">
              <DetailRow label="Event ID">
                <span className="break-all font-mono text-xs">
                  {log.id}
                </span>
              </DetailRow>

              <DetailRow label="Event type">
                <span className="break-all font-mono text-xs">
                  {log.eventType}
                </span>
              </DetailRow>

              <DetailRow label="Timestamp">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-text-muted" />
                  {formatDate(log.createdAt)}
                </span>
              </DetailRow>

              <DetailRow label="Request ID">
                {log.requestId ? (
                  <span className="break-all font-mono text-xs">
                    {log.requestId}
                  </span>
                ) : (
                  'Not available'
                )}
              </DetailRow>
            </div>
          </section>

          <section>
            <SectionHeading>
              <Activity size={16} />
              Performed by
            </SectionHeading>

            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-sm font-bold text-text">
                  {log.actor.name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">
                    {log.actor.name}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {log.actor.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-muted">Assigned role</p>
                  <p className="mt-1 text-sm font-medium text-text">
                    {log.actor.role}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-muted">Actor type</p>
                  <p className="mt-1 text-sm font-medium capitalize text-text">
                    {log.actor.type}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-muted">Actor ID</p>
                  <p className="mt-1 break-all font-mono text-xs text-text">
                    {log.actor.id}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {log.resource && (
            <section>
              <SectionHeading>
                <Hash size={16} />
                Affected resource
              </SectionHeading>

              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-text">
                  {log.resource.title}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {log.resource.type}
                </p>

                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs text-text-muted">Resource ID</p>
                  <p className="mt-1 break-all font-mono text-xs text-text">
                    {log.resource.id}
                  </p>
                </div>
              </div>
            </section>
          )}

          {log.changes && log.changes.length > 0 && (
            <section>
              <SectionHeading>
                <Activity size={16} />
                Recorded changes
              </SectionHeading>

              <div className="space-y-3">
                {log.changes.map((change, index) => (
                  <div
                    key={`${change.field}-${index}`}
                    className="rounded-xl border border-border p-4"
                  >
                    <p className="mb-3 text-sm font-semibold text-text">
                      {change.label}
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="min-w-0 rounded-lg bg-red-500/5 p-3">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                          Previous value
                        </p>
                        <pre className="whitespace-pre-wrap break-words font-sans text-xs text-text-muted">
                          {formatValue(change.before)}
                        </pre>
                      </div>

                      <div className="min-w-0 rounded-lg bg-emerald-500/5 p-3">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Updated value
                        </p>
                        <pre className="whitespace-pre-wrap break-words font-sans text-xs text-text">
                          {formatValue(change.after)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeading>
              <Globe2 size={16} />
              Request information
            </SectionHeading>

            <div className="rounded-xl border border-border p-4">
              <div className="divide-y divide-border">
                <DetailRow label="IP address">
                  {log.ipAddress ? (
                    <span className="font-mono text-xs">
                      {log.ipAddress}
                    </span>
                  ) : (
                    'Not recorded'
                  )}
                </DetailRow>

                <DetailRow label="Location">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-text-muted" />
                    {log.location || 'Not recorded'}
                  </span>
                </DetailRow>

                <DetailRow label="User agent">
                  <span className="inline-flex items-start gap-1.5 break-all text-xs">
                    <Monitor
                      size={14}
                      className="mt-0.5 shrink-0 text-text-muted"
                    />
                    {log.userAgent || 'Not recorded'}
                  </span>
                </DetailRow>
              </div>
            </div>
          </section>

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <section>
              <SectionHeading>
                <Hash size={16} />
                Additional metadata
              </SectionHeading>

              <div className="overflow-x-auto rounded-xl border border-border bg-surface-secondary/40 p-4">
                <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-text-muted">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </section>
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button
            type="button"
            onClick={() => copyValue(log.id)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text transition-colors hover:bg-surface-secondary"
          >
            <Copy size={15} />
            Copy event ID
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <Check size={15} />
            Done
          </button>
        </footer>
      </aside>
    </div>
  )
}
