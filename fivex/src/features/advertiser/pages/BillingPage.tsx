import { CheckCircle2, CircleDollarSign, FileText, Info, Wallet } from 'lucide-react'
import { LoaderState } from '@/components/loaders/LoaderState'
import { PageLoader } from '@/components/loaders/PageLoader'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { AdvertiserPageHeader } from '../components/AdvertiserPageHeader'
import { AdvertiserStatCard } from '../components/AdvertiserStatCard'
import { CampaignStatusBadge } from '../components/CampaignStatusBadge'
import { useAdvertiserBilling } from '../hooks/useAdvertiserReports'
import { formatDate, formatMoney } from '../utils/format'
import { PLACEMENT_SPEC_BY_ID } from '../utils/placements'

export function BillingPage() {
  const billing = useAdvertiserBilling()

  if (billing.isLoading) return <PageLoader label="Loading billing…" />
  if (billing.isError || !billing.data) {
    return (
      <LoaderState alert title="Couldn't load billing" message={getErrorMessage(billing.error)}>
        <button type="button" onClick={() => billing.refetch()} className="text-sm font-semibold text-accent hover:underline">
          Try again
        </button>
      </LoaderState>
    )
  }

  const { summary, ledger, invoices, paymentsEnabled } = billing.data

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdvertiserPageHeader title="Billing" description="Budgets committed to your campaigns, and your invoices." />

      {!paymentsEnabled && (
        <p className="mb-6 flex items-start gap-2 rounded-2xl border border-accent-border bg-accent-bg px-4 py-3 text-sm text-heading">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          Online payments aren't enabled yet, so no card is charged. Budgets below are tracked as a ledger; our team will contact
          you about invoicing.
        </p>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdvertiserStatCard label="Committed" value={formatMoney(summary.committedCents)} description="In review, running or paused" icon={Wallet} />
        <AdvertiserStatCard label="Running now" value={formatMoney(summary.activeCents)} description="Active campaign budgets" icon={CircleDollarSign} />
        <AdvertiserStatCard label="Completed" value={formatMoney(summary.completedCents)} description="Campaigns that have ended" icon={CheckCircle2} />
        <AdvertiserStatCard label="In drafts" value={formatMoney(summary.draftCents)} description="Not yet submitted" icon={FileText} />
      </div>

      <section className="mb-6 min-w-0 rounded-2xl border border-border bg-card shadow-sm">
        <div className="p-4 sm:p-5">
          <h2 className="text-base font-semibold text-heading">Budget ledger</h2>
          <p className="mt-1 text-xs text-text-muted">Every submitted campaign and the budget it commits.</p>
        </div>
        {ledger.length === 0 ? (
          <p className="border-t border-border p-6 text-center text-sm text-text-muted">Nothing to bill yet. Submitted campaigns appear here.</p>
        ) : (
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-surface">
                <tr className="text-xs font-semibold text-text-muted">
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledger.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-heading">{row.name}</p>
                      <p className="text-xs text-text-muted">{PLACEMENT_SPEC_BY_ID[row.placement].label}</p>
                    </td>
                    <td className="px-4 py-3">
                      <CampaignStatusBadge status={row.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-xs text-text">
                      {formatDate(row.startDate)} – {formatDate(row.endDate)}
                    </td>
                    <td className="px-4 py-3 text-xs text-text">{formatDate(row.submittedAt)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-heading">{formatMoney(row.budgetCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-heading">Invoices</h2>
        {invoices.length === 0 && (
          <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
            No invoices yet.
          </p>
        )}
      </section>
    </div>
  )
}
