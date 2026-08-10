import { Bell } from 'lucide-react'
import type { AuthorNotificationPreferences } from '../../types/authorSettings.types'

interface AuthorPreferencesSectionProps {
  preferences: AuthorNotificationPreferences
  onChange: (
    updates: Partial<AuthorNotificationPreferences>,
  ) => void
}

export function AuthorPreferencesSection({
  preferences,
  onChange,
}: AuthorPreferencesSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
          <Bell className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">
            Author Notifications
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--color-card-text-muted)]">
            Choose which editorial events you want to hear about.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Notification
          label="Editorial updates"
          checked={preferences.editorialUpdates}
          onChange={(checked) =>
            onChange({ editorialUpdates: checked })
          }
        />

        <Notification
          label="Assignment notifications"
          checked={preferences.assignmentNotifications}
          onChange={(checked) =>
            onChange({
              assignmentNotifications: checked,
            })
          }
        />

        <Notification
          label="Revision requests"
          checked={preferences.revisionNotifications}
          onChange={(checked) =>
            onChange({
              revisionNotifications: checked,
            })
          }
        />

        <Notification
          label="Collaboration activity"
          checked={preferences.collaborationNotifications}
          onChange={(checked) =>
            onChange({
              collaborationNotifications: checked,
            })
          }
        />

        <Notification
          label="Investigation activity"
          checked={preferences.investigationNotifications}
          onChange={(checked) =>
            onChange({
              investigationNotifications: checked,
            })
          }
        />
      </div>
    </section>
  )
}

interface NotificationProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function Notification({
  label,
  checked,
  onChange,
}: NotificationProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--color-card-border)] px-4 py-3 transition hover:bg-slate-50">
      <span className="text-sm font-medium text-[var(--color-card-heading)]">
        {label}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[var(--color-accent)]"
      />
    </label>
  )
}