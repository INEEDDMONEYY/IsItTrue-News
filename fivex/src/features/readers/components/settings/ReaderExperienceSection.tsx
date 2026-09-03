import { BookOpenText } from 'lucide-react'
import type { ReaderExperienceSettings } from '../../types/readerSettings.types'

interface ReaderExperienceSectionProps {
  experience: ReaderExperienceSettings
  onChange: (updates: Partial<ReaderExperienceSettings>) => void
}

export function ReaderExperienceSection({
  experience,
  onChange,
}: ReaderExperienceSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
          <BookOpenText className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">
            Reading Experience
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--color-card-text-muted)]">
            Customize how articles look and behave while you read.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">
            Font size
          </label>

          <select
            value={experience.fontSize}
            onChange={(event) =>
              onChange({
                fontSize: event.target.value as ReaderExperienceSettings['fontSize'],
              })
            }
            className="w-full rounded-xl border border-[var(--color-card-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">
            Reading mode theme
          </label>

          <select
            value={experience.theme}
            onChange={(event) =>
              onChange({
                theme: event.target.value as ReaderExperienceSettings['theme'],
              })
            }
            className="w-full rounded-xl border border-[var(--color-card-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="sepia">Sepia</option>
          </select>
        </div>

        <Toggle
          label="Distraction-free reading mode"
          description="Hide navigation, recommendations, and other UI while you read."
          checked={experience.distractionFreeMode}
          onChange={(checked) => onChange({ distractionFreeMode: checked })}
        />

        <Toggle
          label="Auto-save reading progress"
          description="Pick up right where you left off on articles you didn't finish."
          checked={experience.autoSaveProgress}
          onChange={(checked) => onChange({ autoSaveProgress: checked })}
        />

        <Toggle
          label="Show estimated reading time"
          description="Display an estimated read time at the top of articles."
          checked={experience.showEstimatedReadingTime}
          onChange={(checked) => onChange({ showEstimatedReadingTime: checked })}
        />

        <Toggle
          label='"Summaries first" mode'
          description="Show a TL;DR summary before the full article body."
          checked={experience.summariesFirst}
          onChange={(checked) => onChange({ summariesFirst: checked })}
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

function Toggle({ label, description, checked, onChange }: ToggleProps) {
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
