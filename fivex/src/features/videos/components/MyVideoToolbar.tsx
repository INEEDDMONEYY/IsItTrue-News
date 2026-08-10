import { Search, Upload } from 'lucide-react'
import type { MyVideoFilter } from '@/features/videos/hooks/useMyVideos'
import { MyVideoFilters } from './MyVideoFilters'

interface MyVideoToolbarProps {
  filter: MyVideoFilter
  onFilterChange: (value: MyVideoFilter) => void
  search: string
  onSearchChange: (value: string) => void
  onUpload?: () => void
}

export function MyVideoToolbar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onUpload,
}: MyVideoToolbarProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-card-text-muted)]" />

          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search your videos..."
            className="w-full rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-2)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-card-text)] outline-none transition focus:border-[var(--color-accent)]"
          />
        </div>

        {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
          >
            <Upload className="h-4 w-4" />
            Upload Video
          </button>
        )}
      </div>

      <MyVideoFilters
        value={filter}
        onChange={onFilterChange}
      />
    </div>
  )
}