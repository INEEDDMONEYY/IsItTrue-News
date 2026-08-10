
import { CheckCheck, MoreHorizontal } from 'lucide-react'

import { UnreadNotificationCount } from '@/features/notifications/components/UnreadNotificationCount'

interface NotificationToolbarProps {
  unreadCount: number
  onMarkAllAsRead?: () => void
}

export function NotificationToolbar({
  unreadCount,
  onMarkAllAsRead,
}: NotificationToolbarProps) {
  const hasUnreadNotifications = unreadCount > 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <UnreadNotificationCount count={unreadCount} />

        <div>
          <h2 className="text-sm font-semibold text-[var(--color-heading)]">
            Notifications
          </h2>

          <p className="text-xs text-[var(--color-text-muted)]">
            {hasUnreadNotifications
              ? 'You have unread notifications.'
              : 'You are all caught up.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasUnreadNotifications && onMarkAllAsRead && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-bg)] hover:text-[var(--color-accent)]"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all as read</span>
          </button>
        )}

        <button
          type="button"
          aria-label="More notification options"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-bg)] hover:text-[var(--color-accent)]"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

