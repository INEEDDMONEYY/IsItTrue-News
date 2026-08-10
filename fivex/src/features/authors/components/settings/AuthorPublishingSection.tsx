import { FileText } from 'lucide-react'
import type { AuthorPublishingSettings } from '../../types/authorSettings.types'

interface AuthorPublishingSectionProps {
  publishing: AuthorPublishingSettings
  onChange: (updates: Partial<AuthorPublishingSettings>) => void
}

export function AuthorPublishingSection({
  publishing,
  onChange,
}: AuthorPublishingSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
          <FileText className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">
            Publishing Preferences
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--color-card-text-muted)]">
            Configure your default editorial workflow.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">
            Default category
          </label>

          <select
            value={publishing.defaultCategory}
            onChange={(event) =>
              onChange({
                defaultCategory: event.target.value,
              })
            }
            className="w-full rounded-xl border border-[var(--color-card-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
          >
            <option>Investigations</option>
            <option>Politics</option>
            <option>Local</option>
            <option>Business</option>
            <option>Culture</option>
            <option>Technology</option>
            <option>Sports</option>
          </select>
        </div>

        <Toggle
          label="Enable fact-checking by default"
          description="Automatically request fact-check review when appropriate."
          checked={publishing.factCheckingEnabled}
          onChange={(checked) =>
            onChange({ factCheckingEnabled: checked })
          }
        />

        <Toggle
          label="Require source attribution"
          description="Keep source attribution enabled on new articles."
          checked={publishing.sourceAttributionEnabled}
          onChange={(checked) =>
            onChange({
              sourceAttributionEnabled: checked,
            })
          }
        />

        <Toggle
          label="Allow editorial suggestions"
          description="Allow editors to provide suggestions during review."
          checked={publishing.allowEditorialSuggestions}
          onChange={(checked) =>
            onChange({
              allowEditorialSuggestions: checked,
            })
          }
        />
      </div>
    </section>
  )
}

interface ToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 rounded-xl border border-[var(--color-card-border)] p-4">
      <div>
        <p className="text-sm font-semibold text-[var(--color-card-heading)]">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-[var(--color-card-text-muted)]">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[var(--color-accent)]"
      />
    </label>
  )
}