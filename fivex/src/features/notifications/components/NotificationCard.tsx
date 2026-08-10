
import {
  ExternalLink,
  MoreHorizontal,
  Check,
  MailOpen,
  Trash2,
  Circle,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { NotificationStatusBadge } from '@/features/notifications/components/NotificationStatusBadge'
import type { Notification } from '@/features/notifications/types/notification.types'

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onMarkAsUnread: (id: string) => void
  onRemove: (id: string) => void
}

const priorityConfig: Record<
  Notification['priority'],
  {
    label: string
    icon: LucideIcon
    className: string
  }
> = {
  low: {
    label: 'Low priority',
    icon: Circle,
    className: 'text-[var(--color-text-dim)]',
  },
  normal: {
    label: 'Normal priority',
    icon: Circle,
    className: 'text-[var(--color-text-muted)]',
  },
  high: {
    label: 'High priority',
    icon: Circle,
    className: 'text-[var(--color-accent)]',
  },
}

function formatNotificationTime(timestamp: string) {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return timestamp
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onRemove,
}: NotificationCardProps) {
  const priority = priorityConfig[notification.priority]
  const PriorityIcon = priority.icon

  return (
    <article
      className={[
        'group relative rounded-2xl border p-5 transition-all duration-200',
        notification.read
          ? 'border-[var(--color-card-border)] bg-[var(--color-card)]'
          : 'border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] shadow-sm',
      ].join(' ')}
    >
      <div className="flex gap-4">
        <div className="mt-1 flex shrink-0 items-start">
          <span
            className={[
              'h-2.5 w-2.5 rounded-full transition-opacity',
              notification.read
                ? 'bg-[var(--color-text-dim)] opacity-40'
                : 'bg-[var(--color-accent)]',
            ].join(' ')}
            aria-label={notification.read ? 'Read' : 'Unread'}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <NotificationStatusBadge type={notification.type} />

              {notification.priority === 'high' && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)]"
                  title={priority.label}
                >
                  <PriorityIcon className="h-3 w-3 fill-current" />
                  Priority
                </span>
              )}
            </div>

            <div className="relative flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  notification.read
                    ? onMarkAsUnread(notification.id)
                    : onMarkAsRead(notification.id)
                }
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-heading)]"
                aria-label={
                  notification.read
                    ? 'Mark notification as unread'
                    : 'Mark notification as read'
                }
              >
                {notification.read ? (
                  <>
                    <MailOpen className="h-3.5 w-3.5" />
                    Unread
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Read
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onRemove(notification.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-heading)]"
                aria-label="Remove notification"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <MoreHorizontal
                className="hidden h-4 w-4 text-[var(--color-text-dim)] sm:block"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={[
                  'text-base font-semibold',
                  notification.read
                    ? 'text-[var(--color-card-heading)]'
                    : 'text-[var(--color-heading)]',
                ].join(' ')}
              >
                {notification.title}
              </h3>

              {notification.actor && (
                <span className="text-sm text-[var(--color-card-text-muted)]">
                  by {notification.actor.name}
                </span>
              )}
            </div>

            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[var(--color-card-text-muted)]">
              {notification.message}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <time
              dateTime={notification.timestamp}
              className="text-xs text-[var(--color-card-text-dim)]"
            >
              {formatNotificationTime(notification.timestamp)}
            </time>

            {notification.href && notification.actionLabel && (
              <Link
                to={notification.href}
                onClick={() => onMarkAsRead(notification.id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-heading)] px-3 py-2 text-xs font-semibold text-[var(--color-bg)] transition-opacity hover:opacity-85"
              >
                {notification.actionLabel}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

