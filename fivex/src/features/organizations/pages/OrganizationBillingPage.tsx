import { CreditCard, FileText, Receipt } from 'lucide-react'

const MOCK_INVOICES = [
  { id: 'inv_1', date: 'Mar 1, 2026', amount: '$499.00', status: 'Paid' },
  { id: 'inv_2', date: 'Feb 1, 2026', amount: '$499.00', status: 'Paid' },
  { id: 'inv_3', date: 'Jan 1, 2026', amount: '$499.00', status: 'Paid' },
]

export function OrganizationBillingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6 md:p-8">
      <section>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-card)] text-[var(--color-accent)]">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-heading)] md:text-3xl">
              Billing &amp; Plans
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Manage your organization's plan, seats, and billing history.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-card-heading)]">Organization Plan</p>
            <p className="mt-1 text-sm text-[var(--color-card-text-muted)]">10 seats · Billed monthly</p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-[var(--color-card-border)] px-4 py-2 text-sm font-semibold text-[var(--color-card-heading)] hover:border-[var(--color-accent)]"
          >
            Change plan
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            <Receipt className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">Billing history</h2>
        </div>

        <ul className="divide-y divide-[var(--color-card-border)]">
          {MOCK_INVOICES.map((invoice) => (
            <li key={invoice.id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-[var(--color-card-text-dim)]" />
                <span className="text-sm text-[var(--color-card-text)]">{invoice.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-[var(--color-card-heading)]">{invoice.amount}</span>
                <span className="rounded-full bg-[rgba(22,163,74,0.10)] px-3 py-1 text-xs font-medium text-[var(--color-verified)]">
                  {invoice.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
