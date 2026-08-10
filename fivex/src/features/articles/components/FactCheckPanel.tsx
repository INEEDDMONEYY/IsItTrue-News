import { forwardRef } from 'react'
import dayjs from '@/lib/dayjs'
import { VerdictBadge } from '@/features/fact-checks/components/VerdictBadge'
import type { FactCheckDetails } from '../types/articleDetail.types'

interface FactCheckPanelProps {
  factCheck: FactCheckDetails
}

export const FactCheckPanel = forwardRef<HTMLDivElement, FactCheckPanelProps>(
  function FactCheckPanel({ factCheck }, ref) {
    return (
      <div
        ref={ref}
        className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-5 scroll-mt-24"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-card-heading uppercase tracking-wide">
            Fact-Check Status
          </h3>
          <VerdictBadge verdict={factCheck.status} />
        </div>

        <p className="text-sm text-card-text leading-relaxed">{factCheck.summary}</p>

        <dl className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-card-border">
          <div>
            <dt className="text-card-text-dim">Source</dt>
            <dd className="text-card-text font-medium">{factCheck.source}</dd>
          </div>
          <div>
            <dt className="text-card-text-dim">Checked by</dt>
            <dd className="text-card-text font-medium">{factCheck.checkedBy}</dd>
          </div>
          <div>
            <dt className="text-card-text-dim">Checked on</dt>
            <dd className="text-card-text font-medium">
              {dayjs(factCheck.checkedAt).format('MMM D, YYYY')}
            </dd>
          </div>
        </dl>
      </div>
    )
  },
)
