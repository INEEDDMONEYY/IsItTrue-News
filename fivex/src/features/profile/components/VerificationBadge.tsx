import { BadgeCheck, Clock3, ShieldAlert, ShieldQuestion } from 'lucide-react'
import type { VerificationStatus } from '@/features/profile/types/profileIdentity.types'

const BADGES: Record<VerificationStatus, { label: string; className: string; Icon: typeof BadgeCheck }> = {
  verified: {
    label: 'Verified',
    className: 'border-verified/30 bg-verified/10 text-verified',
    Icon: BadgeCheck,
  },
  pending: {
    label: 'Pending review',
    className: 'border-pending/30 bg-pending/10 text-pending',
    Icon: Clock3,
  },
  action_required: {
    label: 'Action required',
    className: 'border-disputed/30 bg-disputed/10 text-disputed',
    Icon: ShieldAlert,
  },
  not_started: {
    label: 'Not verified',
    className: 'border-border bg-card text-text-muted',
    Icon: ShieldQuestion,
  },
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const { label, className, Icon } = BADGES[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${className}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
