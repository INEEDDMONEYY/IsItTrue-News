
import { Plus, Search } from 'lucide-react'

interface DraftToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  onNewArticle: () => void
}

export function DraftToolbar({
  search,
  onSearchChange,
  onNewArticle,
}: DraftToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-card-text-muted)]" />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search drafts..."
          className="h-11 w-full rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] pl-10 pr-4 text-sm text-[var(--color-card-heading)] outline-none placeholder:text-[var(--color-card-text-muted)] transition focus:border-[var(--color-accent)]"
        />
      </div>

      <button
        type="button"
        onClick={onNewArticle}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
      >
        <Plus className="h-4 w-4" />
        New Article
      </button>
    </div>
  )
}

