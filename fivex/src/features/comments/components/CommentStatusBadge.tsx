import type { CommentStatus } from '../types/comment.types'

interface CommentStatusBadgeProps {
  status: CommentStatus
}

const statusConfig: Record<
  CommentStatus,
  {
    label: string
    className: string
  }
> = {
  published: {
    label: 'Published',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  flagged: {
    label: 'Flagged',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  removed: {
    label: 'Removed',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
}

export function CommentStatusBadge({
  status,
}: CommentStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  )
}