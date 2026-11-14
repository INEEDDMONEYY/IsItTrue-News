
import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Clock3,
  Mail,
  MessageSquare,
  Send,
  X,
} from 'lucide-react'

import { mockCollaborationRequests } from '@/features/authors/data/mockCollaborations'
import type {
  CollaborationRequest,
} from '@/features/authors/types/collaboration.types'

type RequestDirection = 'incoming' | 'outgoing'
type RequestFilter = 'all' | 'pending' | 'accepted' | 'declined'

function formatRequestDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function RequestAvatar({
  name,
  avatar,
}: {
  name: string
  avatar?: string
}) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-11 w-11 rounded-full border border-[var(--color-border)] object-cover"
      />
    )
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-sm font-semibold text-[var(--color-heading)]">
      {getInitials(name)}
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: CollaborationRequest['status']
}) {
  const styles = {
    pending:
      'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    accepted:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    declined:
      'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]',
  }

  const labels = {
    pending: 'Awaiting response',
    accepted: 'Accepted',
    declined: 'Declined',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

function RequestCard({
  request,
  onAccept,
  onDecline,
  onWithdraw,
}: {
  request: CollaborationRequest
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onWithdraw: (id: string) => void
}) {
  const isIncoming = request.direction === 'incoming'
  const isPending = request.status === 'pending'

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <RequestAvatar
          name={request.author.name}
          avatar={request.author.avatar}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-[var(--color-heading)]">
                {request.author.name}
              </h3>

              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                @{request.author.username} · {request.author.role}
              </p>
            </div>

            <StatusBadge status={request.status} />
          </div>

          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 p-3 sm:p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Collaboration project
            </p>

            <p className="mt-1 font-medium text-[var(--color-heading)]">
              {request.projectTitle}
            </p>

            <p className="mt-3 text-sm leading-6 text-[var(--color-text)]">
              {request.message}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <Clock3 className="h-3.5 w-3.5" />
              <span>{formatRequestDate(request.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span>{isIncoming ? 'Received' : 'Sent'}</span>
            </div>

            {isPending && (
              <div className="flex flex-wrap gap-2">
                {isIncoming ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onDecline(request.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-3.5 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)]"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </button>

                    <button
                      type="button"
                      onClick={() => onAccept(request.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      <Check className="h-4 w-4" />
                      Accept request
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => onWithdraw(request.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-3.5 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                    Withdraw invitation
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function CollaborationRequests() {
  const [requests, setRequests] = useState<CollaborationRequest[]>(
    mockCollaborationRequests,
  )
  const [direction, setDirection] = useState<RequestDirection>('incoming')
  const [filter, setFilter] = useState<RequestFilter>('all')

  const visibleRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesDirection = request.direction === direction
      const matchesFilter = filter === 'all' || request.status === filter

      return matchesDirection && matchesFilter
    })
  }, [requests, direction, filter])

  const incomingCount = requests.filter(
    (request) =>
      request.direction === 'incoming' && request.status === 'pending',
  ).length

  const outgoingCount = requests.filter(
    (request) =>
      request.direction === 'outgoing' && request.status === 'pending',
  ).length

  function updateRequestStatus(
    requestId: string,
    status: CollaborationRequest['status'],
  ) {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId ? { ...request, status } : request,
      ),
    )
  }

  function handleWithdraw(requestId: string) {
    setRequests((current) =>
      current.filter((request) => request.id !== requestId),
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-[var(--color-accent)]" />
          <h2 className="text-xl font-semibold text-[var(--color-heading)]">
            Collaboration requests
          </h2>
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
          Review invitations, manage collaboration requests, and keep track
          of who you are working with.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <ArrowDownLeft className="h-4 w-4" />
            Incoming
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {incomingCount}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Awaiting your response
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <ArrowUpRight className="h-4 w-4" />
            Outgoing
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--color-heading)]">
            {outgoingCount}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Awaiting their response
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setDirection('incoming')
              setFilter('all')
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              direction === 'incoming'
                ? 'bg-[var(--color-accent)] text-white'
                : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            Received
            {incomingCount > 0 && (
              <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-xs">
                {incomingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setDirection('outgoing')
              setFilter('all')
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              direction === 'outgoing'
                ? 'bg-[var(--color-accent)] text-white'
                : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            Sent
            {outgoingCount > 0 && (
              <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-xs">
                {outgoingCount}
              </span>
            )}
          </button>
        </div>

        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            Status
          </span>
          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as RequestFilter)
            }
            className="min-h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-heading)] outline-none transition focus:border-[var(--color-accent)]"
          >
            <option value="all">All requests</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
        </label>
      </div>

      {visibleRequests.length > 0 ? (
        <div className="space-y-4">
          {visibleRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={(id) => updateRequestStatus(id, 'accepted')}
              onDecline={(id) => updateRequestStatus(id, 'declined')}
              onWithdraw={handleWithdraw}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
            {direction === 'incoming' ? (
              <ArrowDownLeft className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </div>

          <h3 className="mt-4 font-semibold text-[var(--color-heading)]">
            {filter === 'all'
              ? direction === 'incoming'
                ? 'No incoming requests'
                : 'No outgoing invitations'
              : `No ${filter} requests`}
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">
            {direction === 'incoming'
              ? 'When another author invites you to work on a story or investigation, their request will appear here.'
              : 'Invitations you send to other authors will appear here so you can track their responses.'}
          </p>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 p-4">
        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
        <p className="text-xs leading-5 text-[var(--color-text-muted)]">
          Request decisions currently update this demo session only. Backend
          persistence, notifications, and workspace access can be connected
          when the API is ready.
        </p>
      </div>
    </section>
  )
}
