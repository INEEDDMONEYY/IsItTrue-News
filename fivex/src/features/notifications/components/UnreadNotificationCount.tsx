
import { Bell } from 'lucide-react'

interface UnreadNotificationCountProps {
  count: number
  showIcon?: boolean
  label?: string
}

export function UnreadNotificationCount({
  count,
  showIcon = true,
  label = 'Unread',
}: UnreadNotificationCountProps) {
  if (count <= 0) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-2">
      {showIcon && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
          <Bell className="h-4 w-4" aria-hidden="true" />
        </span>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">
          {label}
        </span>

        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-semibold text-white">
          {count > 99 ? '99+' : count}
        </span>
      </div>
    </div>
  )
}

