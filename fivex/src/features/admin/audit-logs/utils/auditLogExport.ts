
import type { AuditLogEvent } from '../types/auditLog.types'
import {
  getAuditLogCategoryLabel,
  getAuditLogOutcomeLabel,
  getAuditLogSeverityLabel,
} from './auditLogFormatters'

const CSV_COLUMNS = [
  'Event ID',
  'Date',
  'Event Type',
  'Action',
  'Description',
  'Category',
  'Severity',
  'Outcome',
  'Actor',
  'Actor Email',
  'Actor Role',
  'Resource Type',
  'Resource',
  'Resource ID',
  'IP Address',
  'Location',
  'User Agent',
  'Request ID',
] as const

function escapeCsvValue(value: unknown): string {
  const text = value === null || value === undefined
    ? ''
    : String(value)

  // Prevent spreadsheet formula injection when opening exported CSV files.
  const safeText = /^[\s]*[=+\-@]/.test(text)
    ? `'${text}`
    : text

  return `"${safeText.replace(/"/g, '""')}"`
}

function getEventRow(event: AuditLogEvent): string[] {
  return [
    event.id,
    event.createdAt,
    event.eventType,
    event.action,
    event.description,
    getAuditLogCategoryLabel(event.category),
    getAuditLogSeverityLabel(event.severity),
    getAuditLogOutcomeLabel(event.outcome),
    event.actor.name,
    event.actor.email,
    event.actor.role,
    event.resource?.type ?? '',
    event.resource?.title ?? '',
    event.resource?.id ?? '',
    event.ipAddress ?? '',
    event.location ?? '',
    event.userAgent ?? '',
    event.requestId ?? '',
  ]
}

export function generateAuditLogCsv(
  events: AuditLogEvent[],
): string {
  const rows = [
    CSV_COLUMNS.map(escapeCsvValue).join(','),
    ...events.map((event) =>
      getEventRow(event).map(escapeCsvValue).join(','),
    ),
  ]

  return `\uFEFF${rows.join('\r\n')}`
}

export function downloadAuditLogCsv(
  events: AuditLogEvent[],
  filename = 'audit-logs',
): void {
  if (typeof document === 'undefined') {
    throw new Error('CSV export is only available in a browser.')
  }

  const csv = generateAuditLogCsv(events)
  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${filename.replace(/\.csv$/i, '')}.csv`
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
