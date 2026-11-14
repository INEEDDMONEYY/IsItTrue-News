
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  ShieldAlert,
} from 'lucide-react'

import type {
  AuditLogEvent,
  AuditLogPagination,
} from '../types/auditLog.types'

interface AuditLogTableProps {
  logs: AuditLogEvent[]
  pagination: AuditLogPagination
  loading?: boolean
  onSelect: (log: AuditLogEvent) => void
  onPageChange: (page: number) => void
}

const severityStyles = {
  info: {
    label: 'Informational',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    icon: FileText,
  },
  warning: {
    label: 'Warning',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    icon: AlertTriangle,
  },
  critical: {
    label: 'Critical',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400',
    icon: ShieldAlert,
  },
}

const outcomeStyles = {
  success: {
    label: 'Success',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  failure: {
    label: 'Failed',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400',
    icon: AlertCircle,
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    icon: ShieldAlert,
  },
}

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

function StatusBadge({
  value,
  type,
}: {
  value: keyof typeof severityStyles | keyof typeof outcomeStyles
  type: 'severity' | 'outcome'
}) {
  const config =
    type === 'severity'
      ? severityStyles[value as keyof typeof severityStyles]
      : outcomeStyles[value as keyof typeof outcomeStyles]

  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  )
}

export function AuditLogTable({
  logs,
  pagination,
  loading = false,
  onSelect,
  onPageChange,
}: AuditLogTableProps) {
  const start =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1

  const end = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total,
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">
            Activity history
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Review administrative and system events across the platform.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-muted">
          <Clock3 size={14} />
          {pagination.total.toLocaleString()} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-secondary/60">
              {[
                'Event',
                'Administrator',
                'Resource',
                'Severity',
                'Outcome',
                'Timestamp',
                '',
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-5 py-5">
                      <div className="h-4 w-full max-w-[130px] animate-pulse rounded bg-surface-secondary" />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary text-text-muted">
                      <FileText size={22} />
                    </div>
                    <p className="font-semibold text-text">
                      No audit events found
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      Try adjusting your search or filters to find activity.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="group transition-colors hover:bg-surface-secondary/50"
                >
                  <td className="max-w-[260px] px-5 py-4">
                    <p className="truncate text-sm font-semibold text-text">
                      {log.action}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
                      {log.description}
                    </p>
                    <p className="mt-1.5 font-mono text-[11px] text-text-muted">
                      {log.id}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-[11px] font-semibold text-text">
                        {getInitials(log.actor.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[150px] truncate text-sm font-medium text-text">
                          {log.actor.name}
                        </p>
                        <p className="max-w-[150px] truncate text-xs text-text-muted">
                          {log.actor.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="max-w-[180px] px-5 py-4">
                    {log.resource ? (
                      <>
                        <p className="truncate text-sm font-medium text-text">
                          {log.resource.title}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {log.resource.type}
                        </p>
                      </>
                    ) : (
                      <span className="text-sm text-text-muted">
                        No resource
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge value={log.severity} type="severity" />
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge value={log.outcome} type="outcome" />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="text-sm text-text">
                      {formatDate(log.createdAt)}
                    </p>
                    <p className="mt-1 text-xs capitalize text-text-muted">
                      {log.category.replaceAll('-', ' ')}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onSelect(log)}
                      aria-label={`View details for ${log.action}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-accent hover:bg-accent/5 hover:text-accent"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-muted">
          Showing <span className="font-semibold text-text">{start}</span>–
          <span className="font-semibold text-text">{end}</span> of{' '}
          <span className="font-semibold text-text">
            {pagination.total.toLocaleString()}
          </span>{' '}
          events
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={loading || pagination.page <= 1}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium text-text transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={15} />
            Previous
          </button>

          <span className="min-w-[90px] text-center text-xs text-text-muted">
            Page {pagination.page} of {Math.max(1, pagination.totalPages)}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={
              loading ||
              pagination.page >= pagination.totalPages
            }
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium text-text transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </section>
  )
}
