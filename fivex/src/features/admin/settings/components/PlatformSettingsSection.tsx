import { useState } from 'react'

interface ToggleRowProps {
  label: string
  description: string
  defaultChecked?: boolean
}

function ToggleRow({ label, description, defaultChecked = false }: ToggleRowProps) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-card-border last:border-b-0">
      <div>
        <p className="text-sm text-card-heading">{label}</p>
        <p className="text-xs text-card-text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked((v) => !v)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-accent' : 'bg-card-2'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export function PlatformSettingsSection() {
  return (
    <section className="rounded-2xl border border-card-border bg-card p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-card-heading">Platform settings</h2>
        <span className="text-[10px] uppercase tracking-wide text-card-text-dim px-2 py-0.5 rounded-full border border-card-border">
          Preview
        </span>
      </div>
      <p className="text-xs text-card-text-muted mb-3">
        These platform-wide toggles are not yet persisted to the backend — they're a preview
        of upcoming settings.
      </p>

      <div>
        <ToggleRow
          label="Allow new registrations"
          description="Let visitors create a reader account from the sign-up page."
          defaultChecked
        />
        <ToggleRow
          label="Require email verification"
          description="New accounts must verify their email before signing in."
          defaultChecked
        />
        <ToggleRow
          label="Maintenance mode"
          description="Show a maintenance banner and block reader access to the site."
        />
      </div>
    </section>
  )
}
