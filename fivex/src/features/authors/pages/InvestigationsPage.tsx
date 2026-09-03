import { Link } from 'react-router-dom'
import { FilePlus2 } from 'lucide-react'
import { PaywallGate } from '@/features/billing/components/PaywallGate'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyStateCard } from '@/components/cards'
import { BriefcaseBusiness } from 'lucide-react'
import { useInvestigationWorkspace } from '../hooks/useInvestigationWorkspace'
import type { InvestigationStatus } from '@/features/investigations/types/investigation.types'
import dayjs from '@/lib/dayjs'

const STATUS_STYLES: Record<InvestigationStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-card-2 text-card-text-muted border-card-border' },
  pending_review: { label: 'Pending Review', className: 'bg-pending/10 text-pending border-pending/30' },
  published: { label: 'Published', className: 'bg-verified/10 text-verified border-verified/30' },
  rejected: { label: 'Rejected', className: 'bg-disputed/10 text-disputed border-disputed/30' },
}

export function InvestigationsPage() {
  return (
    <PaywallGate feature="investigations">
      <InvestigationsPageContent />
    </PaywallGate>
  )
}

function InvestigationsPageContent() {
  const { investigations, isLoading } = useInvestigationWorkspace()

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="text-2xl font-semibold text-heading">My Investigations</h1>
        <Link
          to="/author/investigations/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <FilePlus2 className="w-4 h-4" />
          New Investigation
        </Link>
      </div>
      <p className="text-sm text-text-muted mb-6">
        Long-form investigative projects you own or collaborate on, from lead to publication.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : investigations.length === 0 ? (
        <EmptyStateCard
          icon={BriefcaseBusiness}
          title="No investigations yet"
          description="Long-form investigative projects you start will show up here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-card-2 text-left text-card-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investigations.map((investigation) => {
                const status = STATUS_STYLES[investigation.status]
                return (
                  <tr key={investigation.id} className="border-t border-card-border">
                    <td className="px-4 py-3 text-card-heading max-w-xs truncate">{investigation.title}</td>
                    <td className="px-4 py-3 text-card-text-muted">{investigation.category || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-card-text-muted">
                      {dayjs(investigation.updatedAt).format('MMM D, YYYY')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/author/investigations/${investigation.id}`}
                        className="text-accent font-medium hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
