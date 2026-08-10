import { Bell, CheckCheck } from 'lucide-react'

import { EmptyStateCard } from '@/components/cards'
import { NotificationFilters } from '@/features/notifications/components/NotificationFilters'
import { NotificationGroup } from '@/features/notifications/components/NotificationGroup'
import { NotificationToolbar } from '@/features/notifications/components/NotificationToolbar'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import type { Notification } from '@/features/notifications/types/notification.types'

function groupByDate(notifications: Notification[]) {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  const groups: Record<'Today' | 'Yesterday' | 'Earlier', Notification[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  }

  notifications.forEach((notification) => {
    const date = new Date(notification.timestamp)
    if (date >= startOfToday) groups.Today.push(notification)
    else if (date >= startOfYesterday) groups.Yesterday.push(notification)
    else groups.Earlier.push(notification)
  })

  return (Object.entries(groups) as Array<[string, Notification[]]>).filter(
    ([, items]) => items.length > 0,
  )
}

export function NotificationsPage() {
  const {
    filteredNotifications,
    stats,
    filter,
    setReadFilter,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeNotification,
  } = useNotifications()

  const groupedNotifications = groupByDate(filteredNotifications)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
            <Bell className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-heading)] sm:text-3xl">
              Notifications
            </h1>

            <p className="text-sm text-[var(--color-text-muted)] sm:text-base">
              Stay up to date with activity across your author workspace.
            </p>
          </div>
        </div>
      </header>

      <NotificationToolbar
        unreadCount={stats.unread}
        onMarkAllAsRead={markAllAsRead}
      />

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-heading)]">
            Filter notifications
          </h2>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Quickly narrow the list down to unread or already-read
            notifications.
          </p>
        </div>

        <NotificationFilters value={filter.read} onChange={setReadFilter} />
      </section>

      {filteredNotifications.length === 0 ? (
        <EmptyStateCard
          icon={CheckCheck}
          title={
            filter.read === 'unread'
              ? 'You are all caught up'
              : 'No notifications found'
          }
          description={
            filter.read === 'unread'
              ? 'There are no unread notifications waiting for you.'
              : 'There are no notifications matching the selected filter.'
          }
        />
      ) : (
        <div className="space-y-6">
          {groupedNotifications.map(([group, groupNotifications]) => (
            <NotificationGroup
              key={group}
              title={group}
              notifications={groupNotifications}
              onMarkAsRead={markAsRead}
              onMarkAsUnread={markAsUnread}
              onRemove={removeNotification}
            />
          ))}
        </div>
      )}
    </div>
  )
}

