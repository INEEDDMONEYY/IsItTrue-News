
import { Bell, Check, MailOpen } from 'lucide-react'

export type NotificationReadFilter = 'all' | 'unread' | 'read'

interface NotificationFiltersProps {
  value: NotificationReadFilter
  onChange: (value: NotificationReadFilter) => void
}

const filters = [
  {
    value: 'all' as const,
    label: 'All',
    icon: Bell,
  },
  {
    value: 'unread' as const,
    label: 'Unread',
    icon: MailOpen,
  },
  {
    value: 'read' as const,
    label: 'Read',
    icon: Check,
  },
]

export function NotificationFilters({
  value,
  onChange,
}: NotificationFiltersProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Notification filters"
    >
      {filters.map((filter) => {
        const Icon = filter.icon
        const isActive = value === filter.value

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
              isActive
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-sm'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-bg)] hover:text-[var(--color-accent)]'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{filter.label}</span>
          </button>
        )
      })}
    </div>
  )
}

