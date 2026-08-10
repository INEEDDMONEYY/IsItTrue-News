import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
}

/**
 * Small metric tile used across dashboard overview/analytics pages
 * (admin, author, editor). Keep this as the single source of truth instead
 * of redefining a local "MetricTile" per page.
 */
export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-accent-bg flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <p className="text-xs text-card-text-dim">{label}</p>
        <p className="text-xl font-semibold text-card-heading">{value}</p>
      </div>
    </div>
  )
}
