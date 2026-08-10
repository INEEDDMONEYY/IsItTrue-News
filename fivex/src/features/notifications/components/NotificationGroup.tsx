
import { NotificationCard } from '@/features/notifications/components/NotificationCard'
import type { Notification } from '@/features/notifications/types/notification.types'

interface NotificationGroupProps {
  title: string
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAsUnread: (id: string) => void
  onRemove: (id: string) => void
}

export function NotificationGroup({
  title,
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onRemove,
}: NotificationGroupProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">
        {title}
      </h3>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onMarkAsUnread={onMarkAsUnread}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  )
}

