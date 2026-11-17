// Metric formatting. A null value means the denominator was zero, so it is shown as "No data", never as 0.
export const NO_DATA_LABEL = 'No data'

export function formatCount(value: number): string {
  return value.toLocaleString()
}

export function formatPercent(value: number | null): string {
  return value === null ? NO_DATA_LABEL : `${(value * 100).toFixed(1)}%`
}

export function formatHours(value: number | null): string {
  if (value === null) return NO_DATA_LABEL
  if (value < 1) return `${Math.round(value * 60)} min`
  return `${value.toFixed(1)} h`
}

export function formatReadingSeconds(value: number | null): string {
  if (value === null) return NO_DATA_LABEL
  const total = Math.round(value)
  const minutes = Math.floor(total / 60)
  const seconds = String(total % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

// Whole UTC days ending today, matching the backend's UTC day boundaries.
export function rangeForDays(days: number, now: Date = new Date()): { from: string; to: string } {
  const to = now.toISOString().slice(0, 10)
  const from = new Date(Date.parse(`${to}T00:00:00Z`) - (days - 1) * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  return { from, to }
}
