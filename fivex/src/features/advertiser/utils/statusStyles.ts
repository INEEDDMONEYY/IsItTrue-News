import { CheckCircle2, CircleDot, Clock3, FilePen, PauseCircle, XCircle, type LucideIcon } from 'lucide-react'
import type { CampaignStatus } from '../types/advertiser.types'

export const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending_review: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  paused: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
  completed: 'bg-muted text-muted-foreground',
}

export const STATUS_ICONS: Record<CampaignStatus, LucideIcon> = {
  draft: FilePen,
  active: CheckCircle2,
  pending_review: Clock3,
  paused: PauseCircle,
  rejected: XCircle,
  completed: CircleDot,
}

// Campaigns in these states have never been shown, so their delivery numbers are shown as "—", not 0.
export function hasNoDelivery(status: CampaignStatus): boolean {
  return status === 'draft' || status === 'pending_review'
}
