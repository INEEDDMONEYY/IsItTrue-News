import { Compass } from 'lucide-react'
import type { ReaderContentPreferences } from '../../types/readerSettings.types'

interface ReaderContentPreferencesSectionProps {
  content: ReaderContentPreferences
  onChange: (updates: Partial<ReaderContentPreferences>) => void
}

const TOPIC_OPTIONS = [
  'Politics',
  'Crime',
  'Environment',
  'Tech',
  'Local News',
  'Business',
  'Health',
  'Science',
]

const REGION_OPTIONS = ['Local', 'National', 'International']

const FORMAT_OPTIONS = ['Articles', 'Videos', 'Investigations', 'Timelines']

export function ReaderContentPreferencesSection({
  content,
  onChange,
}: ReaderContentPreferencesSectionProps) {
  const toggleValue = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

  return (
    <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
          <Compass className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">
            Content Preferences
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--color-card-text-muted)]">
            Choose what you want to see more of across the site.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <ChipGroup
          label="Topics"
          options={TOPIC_OPTIONS}
          selected={content.topics}
          onToggle={(value) => onChange({ topics: toggleValue(content.topics, value) })}
        />

        <ChipGroup
          label="Regions"
          options={REGION_OPTIONS}
          selected={content.regions}
          onToggle={(value) => onChange({ regions: toggleValue(content.regions, value) })}
        />

        <ChipGroup
          label="Formats"
          options={FORMAT_OPTIONS}
          selected={content.formats}
          onToggle={(value) => onChange({ formats: toggleValue(content.formats, value) })}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">
            Depth
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DepthOption
              label="Quick summaries"
              description="Short, scannable overviews of the news."
              active={content.depth === 'quick-summaries'}
              onClick={() => onChange({ depth: 'quick-summaries' })}
            />

            <DepthOption
              label="Full investigative breakdowns"
              description="In-depth reporting with complete context and sourcing."
              active={content.depth === 'full-investigative'}
              onClick={() => onChange({ depth: 'full-investigative' })}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

interface ChipGroupProps {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}

function ChipGroup({ label, options, selected, onToggle }: ChipGroupProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                isSelected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)] text-[var(--color-accent)]'
                  : 'border-[var(--color-card-border)] text-[var(--color-card-text-muted)] hover:bg-slate-50'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface DepthOptionProps {
  label: string
  description: string
  active: boolean
  onClick: () => void
}

function DepthOption({ label, description, active, onClick }: DepthOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)]'
          : 'border-[var(--color-card-border)] hover:bg-slate-50'
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          active ? 'text-[var(--color-accent)]' : 'text-[var(--color-card-heading)]'
        }`}
      >
        {label}
      </p>

      <p className="mt-1 text-xs leading-5 text-[var(--color-card-text-muted)]">
        {description}
      </p>
    </button>
  )
}
