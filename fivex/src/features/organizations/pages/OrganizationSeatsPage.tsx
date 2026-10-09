import { Users, Mail, Crown, UserPlus } from 'lucide-react'

interface Seat {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  status: 'active' | 'invited'
}

const MOCK_SEATS: Seat[] = [
  { id: '1', name: 'Jordan Blake', email: 'jordan@organization.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Priya Natarajan', email: 'priya@organization.com', role: 'member', status: 'active' },
  { id: '3', name: 'Sam Whitfield', email: 'sam@organization.com', role: 'member', status: 'invited' },
]

export function OrganizationSeatsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6 md:p-8">
      <section>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-card)] text-[var(--color-accent)]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-heading)] md:text-3xl">
              Team Seats
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Manage the members on your organization account and invite new teammates.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">
            {MOCK_SEATS.length} of 10 seats used
          </h2>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-on-brand transition"
          >
            <UserPlus className="h-4 w-4" />
            Invite teammate
          </button>
        </div>

        <ul className="divide-y divide-[var(--color-card-border)]">
          {MOCK_SEATS.map((seat) => (
            <li key={seat.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
                  {seat.role === 'admin' ? <Crown className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-card-heading)]">{seat.name}</p>
                  <p className="text-xs text-[var(--color-card-text-muted)]">{seat.email}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  seat.status === 'active'
                    ? 'bg-[rgba(22,163,74,0.10)] text-[var(--color-verified)]'
                    : 'bg-[rgba(234,179,8,0.10)] text-[var(--color-pending)]'
                }`}
              >
                {seat.status === 'active' ? 'Active' : 'Invited'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
