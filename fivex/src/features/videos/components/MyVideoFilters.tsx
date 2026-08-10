import type { MyVideoFilter } from '@/features/videos/hooks/useMyVideos'

interface MyVideoFiltersProps {
  value: MyVideoFilter
  onChange: (value: MyVideoFilter) => void
}

const filters: {
  label: string
  value: MyVideoFilter
}[] = [
  { label: 'All Videos', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Revision Requested', value: 'revision_requested' },
]

export function MyVideoFilters({
  value,
  onChange,
}: MyVideoFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const active = value === filter.value

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                : 'border-[var(--color-card-border)] bg-[var(--color-card)] text-[var(--color-card-text)] hover:bg-[var(--color-card-2)]'
            }`}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}