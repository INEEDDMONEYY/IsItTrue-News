import { Award, Plus, X } from 'lucide-react'
import type { AuthorExpertiseSettings } from '../../types/authorSettings.types'

interface AuthorExpertiseSectionProps {
  expertise: AuthorExpertiseSettings
  onChange: (updates: Partial<AuthorExpertiseSettings>) => void
}

export function AuthorExpertiseSection({
  expertise,
  onChange,
}: AuthorExpertiseSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
          <Award className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[var(--color-card-heading)]">
            Expertise & Coverage
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--color-card-text-muted)]">
            Help editors understand the subjects and regions you
            cover.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <TagGroup
          label="Primary beats"
          values={expertise.primaryBeats}
          onChange={(values) =>
            onChange({ primaryBeats: values })
          }
        />

        <TagGroup
          label="Secondary beats"
          values={expertise.secondaryBeats}
          onChange={(values) =>
            onChange({ secondaryBeats: values })
          }
        />

        <TagGroup
          label="Areas of expertise"
          values={expertise.areasOfExpertise}
          onChange={(values) =>
            onChange({ areasOfExpertise: values })
          }
        />

        <TagGroup
          label="Geographic coverage"
          values={expertise.geographicCoverage}
          onChange={(values) =>
            onChange({ geographicCoverage: values })
          }
        />

        <div className="max-w-xs">
          <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">
            Years of experience
          </label>

          <input
            type="number"
            min="0"
            value={expertise.yearsOfExperience}
            onChange={(event) =>
              onChange({
                yearsOfExperience: Number(event.target.value),
              })
            }
            className="w-full rounded-xl border border-[var(--color-card-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
          />
        </div>
      </div>
    </section>
  )
}

interface TagGroupProps {
  label: string
  values: string[]
  onChange: (values: string[]) => void
}

function TagGroup({
  label,
  values,
  onChange,
}: TagGroupProps) {
  const addTag = () => {
    const value = window.prompt(`Add ${label.toLowerCase()}:`)

    if (!value?.trim()) return

    onChange([...values, value.trim()])
  }

  const removeTag = (index: number) => {
    onChange(values.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent)]"
          >
            {value}

            <button
              type="button"
              onClick={() => removeTag(index)}
              className="transition hover:opacity-70"
              aria-label={`Remove ${value}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={addTag}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--color-card-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-card-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
    </div>
  )
}