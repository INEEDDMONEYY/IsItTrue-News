
import type {
  AuditLogCategory,
  AuditLogEvent,
  AuditLogOutcome,
  AuditLogSeverity,
} from '../types/auditLog.types'

const categoryLabels: Record<AuditLogCategory, string> = {
  authentication: 'Authentication',
  users: 'Users',
  roles: 'Roles & permissions',
  articles: 'Articles',
  'fact-checks': 'Fact-checks',
  investigations: 'Investigations',
  'case-files': 'Case files',
  evidence: 'Evidence',
  sources: 'Sources',
  newsletter: 'Newsletter',
  advertisements: 'Advertisements',
  settings: 'Settings',
  system: 'System',
}

const severityLabels: Record<AuditLogSeverity, string> = {
  info: 'Informational',
  warning: 'Warning',
  critical: 'Critical',
}

const outcomeLabels: Record<AuditLogOutcome, string> = {
  success: 'Successful',
  failure: 'Failed',
  blocked: 'Blocked',
}

export function formatAuditLogDate(
  value: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...options,
  }).format(date)
}

export function formatAuditLogRelativeTime(value: string): string {
  const date = new Date(value)
  const timestamp = date.getTime()

  if (Number.isNaN(timestamp)) {
    return 'Unknown time'
  }

  const difference = timestamp - Date.now()
  const absoluteDifference = Math.abs(difference)

  const units: Array<{
    limit: number
    unit: Intl.RelativeTimeFormatUnit
    milliseconds: number
  }> = [
    { limit: 60_000, unit: 'second', milliseconds: 1_000 },
    { limit: 3_600_000, unit: 'minute', milliseconds: 60_000 },
    { limit: 86_400_000, unit: 'hour', milliseconds: 3_600_000 },
    { limit: 604_800_000, unit: 'day', milliseconds: 86_400_000 },
    { limit: 2_629_746_000, unit: 'week', milliseconds: 604_800_000 },
    { limit: 31_556_952_000, unit: 'month', milliseconds: 2_629_746_000 },
  ]

  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: 'auto',
  })

  for (const unit of units) {
    if (absoluteDifference < unit.limit) {
      const amount = Math.round(difference / unit.milliseconds)
      return formatter.format(amount, unit.unit)
    }
  }

  return formatter.format(
    Math.round(difference / 31_556_952_000),
    'year',
  )
}

export function getAuditLogCategoryLabel(
  category: AuditLogCategory,
): string {
  return categoryLabels[category] ?? category
}

export function getAuditLogSeverityLabel(
  severity: AuditLogSeverity,
): string {
  return severityLabels[severity] ?? severity
}

export function getAuditLogOutcomeLabel(
  outcome: AuditLogOutcome,
): string {
  return outcomeLabels[outcome] ?? outcome
}

export function formatAuditLogValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'string') {
    return value.trim() || '—'
  }

  if (typeof value === 'number') {
    return value.toLocaleString()
  }

  if (Array.isArray(value)) {
    return value.length ? value.map(formatAuditLogValue).join(', ') : '—'
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return '[Unable to display value]'
    }
  }

  return String(value)
}

export function getAuditLogActorLabel(
  event: AuditLogEvent,
): string {
  return event.actor.name || event.actor.email || 'Unknown actor'
}
