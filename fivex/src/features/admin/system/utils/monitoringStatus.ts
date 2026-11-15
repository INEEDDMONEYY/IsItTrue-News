import type { MonitoringSectionSnapshot, MonitoringStatus } from '../types/monitoring.types'

export const MONITORING_INTERVAL = {
  defaultMs: 30_000,
  minMs: 10_000,
  maxMs: 300_000,
  staleAfterIntervals: 3,
} as const

export function clampInterval(ms: number): number {
  if (!Number.isFinite(ms)) return MONITORING_INTERVAL.defaultMs
  return Math.min(MONITORING_INTERVAL.maxMs, Math.max(MONITORING_INTERVAL.minMs, ms))
}

export function isSnapshotStale(lastSuccessAt: number | null, now: number, intervalMs: number): boolean {
  if (lastSuccessAt === null) return true
  return now - lastSuccessAt > intervalMs * MONITORING_INTERVAL.staleAfterIntervals
}

const KNOWN_STATUSES: readonly MonitoringStatus[] = ['operational', 'degraded', 'down', 'unknown']

/** Missing, stale, or unrecognised data is Unknown. It is never treated as Operational. */
export function resolveDisplayStatus(section: MonitoringSectionSnapshot | undefined, isStale: boolean): MonitoringStatus {
  if (!section || isStale) return 'unknown'
  return KNOWN_STATUSES.includes(section.status) ? section.status : 'unknown'
}

export const STATUS_LABELS: Record<MonitoringStatus, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
  unknown: 'Unknown',
}

export const STATUS_BADGE_CLASSES: Record<MonitoringStatus, string> = {
  operational: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600',
  degraded: 'border-amber-500/40 bg-amber-500/10 text-amber-600',
  down: 'border-red-500/40 bg-red-500/10 text-red-600',
  unknown: 'border-slate-500/40 bg-slate-500/10 text-slate-500',
}

export function formatTimestamp(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Never'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString()
}

export function formatMetricLabel(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export function formatMetricValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2)
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
