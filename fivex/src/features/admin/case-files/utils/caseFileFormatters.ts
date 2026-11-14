
import type {
  CaseFileAccessLevel,
  CaseFileCategory,
  CaseFilePriority,
  CaseFileStatus,
} from '../types/caseFile.types'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export const formatCaseFileDate = (
  value?: string | null,
  fallback = 'Not available',
): string => {
  if (!value) return fallback

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return fallback

  return dateFormatter.format(date)
}

export const formatCaseFileDateTime = (
  value?: string | null,
  fallback = 'Not available',
): string => {
  if (!value) return fallback

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return fallback

  return dateTimeFormatter.format(date)
}

export const formatCaseFileRelativeTime = (
  value?: string | null,
  fallback = 'Unknown date',
): string => {
  if (!value) return fallback

  const date = new Date(value)
  const timestamp = date.getTime()

  if (Number.isNaN(timestamp)) return fallback

  const difference = timestamp - Date.now()
  const absoluteDifference = Math.abs(difference)

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  const units = [
    { duration: year, label: 'year' },
    { duration: month, label: 'month' },
    { duration: week, label: 'week' },
    { duration: day, label: 'day' },
    { duration: hour, label: 'hour' },
    { duration: minute, label: 'minute' },
  ]

  const unit = units.find(
    (item) => absoluteDifference >= item.duration,
  )

  if (!unit) return 'Just now'

  const amount = Math.floor(absoluteDifference / unit.duration)
  const label = `${amount} ${unit.label}${amount === 1 ? '' : 's'}`

  return difference < 0 ? `${label} ago` : `In ${label}`
}

export const getCaseFileStatusLabel = (
  status: CaseFileStatus,
): string => {
  const labels: Record<CaseFileStatus, string> = {
    draft: 'Draft',
    active: 'Active',
    'under-review': 'Under Review',
    published: 'Published',
    closed: 'Closed',
    archived: 'Archived',
  }

  return labels[status]
}

export const getCaseFilePriorityLabel = (
  priority: CaseFilePriority,
): string => {
  const labels: Record<CaseFilePriority, string> = {
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    critical: 'Critical',
  }

  return labels[priority]
}

export const getCaseFileAccessLabel = (
  accessLevel: CaseFileAccessLevel,
): string => {
  const labels: Record<CaseFileAccessLevel, string> = {
    internal: 'Internal',
    restricted: 'Restricted',
    confidential: 'Confidential',
  }

  return labels[accessLevel]
}

export const getCaseFileCategoryLabel = (
  category: CaseFileCategory,
): string => {
  const labels: Record<CaseFileCategory, string> = {
    politics: 'Politics',
    government: 'Government',
    business: 'Business',
    'public-safety': 'Public Safety',
    health: 'Health',
    technology: 'Technology',
    environment: 'Environment',
    education: 'Education',
    international: 'International',
    'social-issues': 'Social Issues',
    other: 'Other',
  }

  return labels[category]
}

export const formatCaseFileReference = (
  reference?: string | null,
): string => reference?.trim() || 'Unassigned reference'

export const formatCaseFileCount = (
  count: number,
  singular: string,
  plural = `${singular}s`,
): string => {
  const safeCount = Number.isFinite(count) ? Math.max(0, count) : 0

  return `${safeCount.toLocaleString('en-US')} ${
    safeCount === 1 ? singular : plural
  }`
}

export const formatCaseFileValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return value.toLocaleString('en-US')
  }

  if (Array.isArray(value)) {
    return value.map(formatCaseFileValue).join(', ')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}
