
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import type { AuditLogSummary } from '../types/auditLog.types'

interface AuditLogSummaryCardsProps {
  summary: AuditLogSummary
  loading?: boolean
}

const metrics = [
  {
    key: 'totalEvents',
    label: 'Total events',
    description: 'Recorded audit events',
    icon: Activity,
    getValue: (summary: AuditLogSummary) =>
      summary.totalEvents.toLocaleString(),
  },
  {
    key: 'eventsToday',
    label: 'Events today',
    description: 'Recorded in the last day',
    icon: CalendarDays,
    getValue: (summary: AuditLogSummary) =>
      summary.eventsToday.toLocaleString(),
  },
  {
    key: 'adminActions',
    label: 'Admin actions',
    description: 'Actions performed by admins',
    icon: ShieldCheck,
    getValue: (summary: AuditLogSummary) =>
      summary.adminActions.toLocaleString(),
  },
  {
    key: 'securityEvents',
    label: 'Security events',
    description: 'Authentication and access events',
    icon: ShieldAlert,
    getValue: (summary: AuditLogSummary) =>
      summary.securityEvents.toLocaleString(),
  },
  {
    key: 'failedActions',
    label: 'Failed actions',
    description: 'Unsuccessful or blocked actions',
    icon: AlertTriangle,
    getValue: (summary: AuditLogSummary) =>
      summary.failedActions.toLocaleString(),
  },
] as const

function SummaryCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-5 h-9 w-9 animate-pulse rounded-xl bg-surface-secondary" />
      <div className="mb-2 h-7 w-20 animate-pulse rounded bg-surface-secondary" />
      <div className="h-4 w-28 animate-pulse rounded bg-surface-secondary" />
    </div>
  )
}

export function AuditLogSummaryCards({
  summary,
  loading = false,
}: AuditLogSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <SummaryCardSkeleton key={metric.key} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric) => {
        const Icon = metric.icon

        return (
          <div
            key={metric.key}
            className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border/70 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-secondary text-text-muted">
                <Icon size={18} />
              </div>
            </div>

            <p className="text-2xl font-semibold tracking-tight text-text">
              {metric.getValue(summary)}
            </p>

            <p className="mt-1 text-sm font-medium text-text">
              {metric.label}
            </p>

            <p className="mt-1 text-xs text-text-muted">
              {metric.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}
