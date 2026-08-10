import { Ticket, CheckCircle2, RotateCcw } from 'lucide-react'
import { StatCard } from '@/components/cards'
import { useTickets } from '@/features/tickets/hooks/useTickets'
import { getErrorMessage } from '@/lib/getErrorMessage'

export function TicketsPage() {
  const { tickets, isLoading, error, toggleStatus } = useTickets()

  const openTickets = tickets.filter((t) => t.status === 'open')
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved')

  const handleToggle = (id: string) => {
    toggleStatus(id).catch(() => {
      // Errors are surfaced via the query error state on the next fetch.
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Tickets</h1>
      <p className="text-sm text-text-muted mb-6">
        Support requests submitted by users, waiting for a response or resolution.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Open Tickets" value={openTickets.length} icon={Ticket} />
        <StatCard label="Resolved Tickets" value={resolvedTickets.length} icon={CheckCircle2} />
      </div>

      {isLoading && <p className="text-sm text-text-muted mb-4">Loading tickets...</p>}
      {error && (
        <p className="text-sm text-disputed mb-4">
          {getErrorMessage(error, 'Failed to load tickets.')}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-xl border border-card-border bg-card p-4 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-card-heading truncate">{ticket.subject}</p>
                <span
                  className={`shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                    ticket.status === 'open'
                      ? 'bg-pending/10 text-pending border-pending/30'
                      : 'bg-verified/10 text-verified border-verified/30'
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
              <p className="text-xs text-card-text-muted truncate">{ticket.message}</p>
              <p className="text-xs text-card-text-dim">
                {ticket.submittedByName} ({ticket.submittedByEmail}) ·{' '}
                {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(ticket.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs shrink-0 transition-colors ${
                ticket.status === 'open'
                  ? 'bg-verified/10 text-verified border border-verified/30 hover:bg-verified/20'
                  : 'bg-card-2 text-card-text-muted border border-card-border hover:text-card-heading'
              }`}
            >
              {ticket.status === 'open' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolve
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reopen
                </>
              )}
            </button>
          </div>
        ))}

        {!isLoading && tickets.length === 0 && (
          <div className="rounded-xl border border-dashed border-card-border bg-card p-8 text-center text-sm text-card-text-muted">
            There are no support tickets.
          </div>
        )}
      </div>
    </div>
  )
}

