import type { CampaignStatus } from '../types/advertiser.types'
import { STATUS_LABELS } from '../utils/format'
import { STATUS_ICONS, STATUS_STYLES } from '../utils/statusStyles'

export function CampaignStatusBadge({ status, size = 'md' }: { status: CampaignStatus; size?: 'sm' | 'md' }) {
  const Icon = STATUS_ICONS[status]
  const sizing = size === 'sm' ? 'gap-1 px-2 py-1 text-[10px] font-semibold' : 'gap-1.5 px-2.5 py-1 text-xs font-medium'

  return (
    <span className={`inline-flex shrink-0 items-center rounded-full ${sizing} ${STATUS_STYLES[status]}`}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  )
}
