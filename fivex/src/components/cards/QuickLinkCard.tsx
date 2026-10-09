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
      className="flex items-center gap-3 rounded-2xl border border-card-border bg-card-2 p-4 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-accent-bg flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
      <span className="text-sm font-medium text-card-heading">{label}</span>
    </Link>
  )
}