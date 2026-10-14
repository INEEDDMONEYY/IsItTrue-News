import { Link } from 'react-router-dom'
import { AlertTriangle, Flag } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import type { FactCheckRow } from '../types/factCheck.types'
import { EvidenceBadge, PriorityBadge, VerificationStatus } from './FactCheckStatusBadge'

interface FactCheckTableProps {
  records: FactCheckRow[]
  // Dims the rows while a newer page or filter is loading.
  isRefreshing: boolean
}

const COLUMN = 'px-4 py-3 font-medium whitespace-nowrap'

// The queue. Columns follow what an admin needs to triage: the claim, where it appeared, who owns it, whether
// there is anything to check it against, where it stands, how urgent it is, and when it last moved.
export function FactCheckTable({ records, isRefreshing }: FactCheckTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
      <table className={`w-full text-sm transition-opacity ${isRefreshing ? 'opacity-60' : ''}`} aria-busy={isRefreshing}>
        <thead className="bg-card-2 text-left text-card-text-muted">
          <tr>
            <th scope="col" className={COLUMN}>Claim</th>
            <th scope="col" className={COLUMN}>Related article</th>
            <th scope="col" className={COLUMN}>Assigned reviewer</th>
            <th scope="col" className={COLUMN}>Evidence status</th>
            <th scope="col" className={COLUMN}>Verification status</th>
            <th scope="col" className={COLUMN}>Priority</th>
            <th scope="col" className={COLUMN}>Last updated</th>
            <th scope="col" className={`${COLUMN} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t border-card-border hover:bg-card-2/60 transition-colors align-top">
              <td className="px-4 py-3 max-w-[22rem]">
                <Link to={`/admin/fact-checks/${record.id}`} className="font-medium text-card-heading hover:text-accent transition-colors line-clamp-3">
                  {record.claim}
                </Link>
              </td>
              <td className="px-4 py-3 max-w-[16rem] text-card-text-muted">
                {record.article ? <span className="line-clamp-2">{record.article.title}</span> : <span className="italic">Article removed</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-card-text-muted">
                {record.assignee?.name ?? <span className="italic text-pending">Unassigned</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col items-start gap-1">
                  <EvidenceBadge state={record.evidence.state} />
                  {record.evidence.flagged && (
                    <span className="inline-flex items-center gap-1 text-xs text-pending">
                      <Flag className="w-3 h-3" aria-hidden="true" />
                      Flagged
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <VerificationStatus workflow={record.workflowStatus} assessment={record.assessmentStatus} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col items-start gap-1">
                  <PriorityBadge priority={record.priority} />
                  {record.dueAt && (
                    <span className={`inline-flex items-center gap-1 text-xs ${record.overdue ? 'text-disputed font-medium' : 'text-card-text-dim'}`}>
                      {record.overdue && <AlertTriangle className="w-3 h-3" aria-hidden="true" />}
                      {record.overdue ? 'Overdue · ' : 'Due '}
                      {dayjs(record.dueAt).format('MMM D')}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-card-text-muted" title={dayjs(record.updatedAt).format('MMM D, YYYY h:mm A')}>
                {dayjs(record.updatedAt).fromNow()}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/admin/fact-checks/${record.id}`}
                  className="inline-flex rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-card-heading hover:border-accent-border hover:text-accent transition-colors"
                  aria-label={`Inspect: ${record.claim}`}
                >
                  Inspect
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
