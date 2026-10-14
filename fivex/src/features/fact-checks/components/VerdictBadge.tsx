import { CheckCircle2, AlertTriangle, Clock, HelpCircle, CircleDashed, SearchX, type LucideIcon } from 'lucide-react'
import type { PublicVerdict } from '../types/publicFactCheck.types'
import { VERDICT_LABELS } from '../utils/verdicts'

const NEUTRAL = 'bg-card-2 text-card-text-muted border-card-border'

// Red is only for a conclusion that the claim is contradicted. Being unable to confirm a claim is not the same as
// having shown it false, so those verdicts are never red.
const VERDICT_STYLE: Record<PublicVerdict, { icon: LucideIcon; className: string }> = {
  verified: { icon: CheckCircle2, className: 'bg-verified/10 text-verified border-verified/30' },
  partially_supported: { icon: CircleDashed, className: 'bg-accent-bg text-accent border-accent-border' },
  disputed: { icon: AlertTriangle, className: 'bg-disputed/10 text-disputed border-disputed/30' },
  pending: { icon: Clock, className: 'bg-pending/10 text-pending border-pending/30' },
  unverified: { icon: HelpCircle, className: NEUTRAL },
  unable_to_verify: { icon: SearchX, className: NEUTRAL },
}

export function VerdictBadge({ verdict }: { verdict: PublicVerdict }) {
  const { icon: Icon, className } = VERDICT_STYLE[verdict]

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${className}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {VERDICT_LABELS[verdict]}
    </span>
  )
}

