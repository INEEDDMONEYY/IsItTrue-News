import type { MyVideoStatus } from '@/features/videos/types/myVideo.types'

interface MyVideoStatusBadgeProps {
  status: MyVideoStatus
}

const statusConfig: Record<
  MyVideoStatus,
  {
    label: string
    className: string
  }
> = {
  draft: {
    label: 'Draft',
    className:
      'bg-zinc-100 text-zinc-700 border-zinc-200',
  },
  submitted: {
    label: 'Submitted',
    className:
      'bg-blue-50 text-blue-700 border-blue-200',
  },
  under_review: {
    label: 'Under Review',
    className:
      'bg-amber-50 text-amber-700 border-amber-200',
  },
  published: {
    label: 'Published',
    className:
      'bg-green-50 text-green-700 border-green-200',
  },
  revision_requested: {
    label: 'Revision Requested',
    className:
      'bg-orange-50 text-orange-700 border-orange-200',
  },
  rejected: {
    label: 'Rejected',
    className:
      'bg-red-50 text-red-700 border-red-200',
  },
}

export function MyVideoStatusBadge({
  status,
}: MyVideoStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  )
}