
import type { SubmissionStatus } from '@/features/authors/types/submission.types'

const labels: Record<SubmissionStatus, string> = {
  ready: 'Ready to submit',
  submitted: 'Submitted',
  'editor-review': 'Editor review',
  'revision-requested': 'Revision requested',
  approved: 'Approved',
  rejected: 'Rejected',
  published: 'Published',
}

const styles: Record<SubmissionStatus, string> = {
  ready: 'bg-blue-50 text-blue-700 ring-blue-200',
  submitted: 'bg-slate-50 text-slate-700 ring-slate-200',
  'editor-review': 'bg-violet-50 text-violet-700 ring-violet-200',
  'revision-requested': 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

export function SubmissionStatusBadge({
  status,
}: {
  status: SubmissionStatus
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

