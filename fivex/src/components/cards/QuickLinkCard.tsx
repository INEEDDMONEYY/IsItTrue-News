import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface QuickLinkCardProps {
  to: string
  label: string
  icon: LucideIcon
}

export function QuickLinkCard({ to, label, icon: Icon }: QuickLinkCardProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-card-border bg-card p-4 hover:border-accent/50 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-accent-bg flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <span className="text-sm font-medium text-card-heading">{label}</span>
    </Link>
  )
}