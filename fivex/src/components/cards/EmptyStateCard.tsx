import type { LucideIcon } from 'lucide-react'

interface EmptyStateCardProps {
  icon: LucideIcon
  title: string
  description: string
}

/**
 * Dashed-border placeholder card used where a dashboard section has no data
 * yet or is waiting on a backend connection (e.g. bookmarks, analytics charts).
 */
export function EmptyStateCard({ icon: Icon, title, description }: EmptyStateCardProps) {
  return (
    <div className="rounded-2xl border border-dashed border-card-border bg-card p-10 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-accent-bg flex items-center justify-center">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <h2 className="text-lg font-semibold text-card-heading">{title}</h2>
      <p className="text-sm text-card-text-muted max-w-md">{description}</p>
    </div>
  )
}
