import { CheckCircle2, AlertTriangle, Clock, HelpCircle, type LucideIcon } from 'lucide-react'
import type { VerificationStatus } from '@/shared/types/article.types'

const VERDICT_CONFIG: Record<
  VerificationStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  verified: {
    label: 'Verified True',
    icon: CheckCircle2,
    className: 'bg-verified/10 text-verified border-verified/30',
  },
  disputed: {
    label: 'Disputed',
    icon: AlertTriangle,
    className: 'bg-disputed/10 text-disputed border-disputed/30',
  },
  pending: {
    label: 'Under Review',
    icon: Clock,
    className: 'bg-pending/10 text-pending border-pending/30',
  },
  unverified: {
    label: 'Unverified',
    icon: HelpCircle,
    className: 'bg-card-2 text-card-text-muted border-card-border',
  },
}

export function VerdictBadge({ verdict }: { verdict: VerificationStatus }) {
  const { label, icon: Icon, className } = VERDICT_CONFIG[verdict]

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}
