import {
  ArrowDownUp,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import type { BookmarkContentType } from '../types/bookmark.types'

interface BookmarkFiltersProps {
  search: string
  type: BookmarkContentType | 'all'
  sort: 'newest' | 'oldest'
  onSearchChange: (value: string) => void
  onTypeChange: (value: BookmarkContentType | 'all') => void
  onSortChange: (value: 'newest' | 'oldest') => void
}

const filters: {
  label: string
  value: BookmarkContentType | 'all'
}[] = [
  { label: 'All Content', value: 'all' },
  { label: 'Articles', value: 'article' },
  { label: 'Investigations', value: 'investigation' },
  { label: 'Fact Checks', value: 'fact-check' },
  { label: 'Videos', value: 'video' },
  { label: 'Sources', value: 'source' },
  { label: 'Evidence', value: 'evidence' },
]

export default function BookmarkFilters({
  search,
  type,
  sort,
  onSearchChange,
  onTypeChange,
  onSortChange,
}: BookmarkFiltersProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-card-text-dim)]" />

          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search saved content..."
            className="h-11 w-full rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-2)] pl-10 pr-4 text-sm text-[var(--color-card-text)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
          />
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-card-text-muted)]">
          <SlidersHorizontal className="h-4 w-4" />
          Filter saved content
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const active = type === filter.value

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onTypeChange(filter.value)}
              className={[
                'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition',
                active
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'border border-[var(--color-card-border)] bg-[var(--color-card-2)] text-[var(--color-card-text-muted)] hover:border-[var(--color-accent-border)] hover:text-[var(--color-accent)]',
              ].join(' ')}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[var(--color-card-border)] pt-3">
        <ArrowDownUp className="h-4 w-4 text-[var(--color-card-text-dim)]" />

        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as 'newest' | 'oldest')
          }
          className="rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-card-text)] outline-none focus:border-[var(--color-accent)]"
        >
          <option value="newest">Recently saved</option>
          <option value="oldest">Oldest saved</option>
        </select>
      </div>
    </div>
  )
}