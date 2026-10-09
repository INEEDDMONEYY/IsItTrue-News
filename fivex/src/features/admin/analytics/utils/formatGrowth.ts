// The backend sends null when the previous period had nothing to compare against.
export function formatGrowth(percent: number | null, current: number): string {
  if (percent === null) return current > 0 ? 'New' : '—'
  return `${percent > 0 ? '+' : ''}${percent}%`
}
