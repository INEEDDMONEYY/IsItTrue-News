
import type { AuthorArticleStatus } from '../types/authorArticle.types'

interface DraftFiltersProps {
  status: AuthorArticleStatus | 'all'
  category: string
  collaboration: 'all' | 'solo' | 'collaborative'
  categories: string[]
  onStatusChange: (status: AuthorArticleStatus | 'all') => void
  onCategoryChange: (category: string) => void
  onCollaborationChange: (
    value: 'all' | 'solo' | 'collaborative',
  ) => void
}

export function DraftFilters({
  status,
  category,
  collaboration,
  categories,
  onStatusChange,
  onCategoryChange,
  onCollaborationChange,
}: DraftFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <select
        value={status}
        onChange={(event) =>
          onStatusChange(
            event.target.value as AuthorArticleStatus | 'all',
          )
        }
        className="h-11 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 text-sm text-[var(--color-card-heading)] outline-none transition focus:border-[var(--color-accent)]"
      >
        <option value="all">All statuses</option>
        <option value="draft">Draft</option>
        <option value="in-progress">In Progress</option>
        <option value="fact-check-needed">
          Fact Check Needed
        </option>
        <option value="fact-checking">Fact Checking</option>
        <option value="editorial-review">
          Editorial Review
        </option>
        <option value="revision-requested">
          Revision Requested
        </option>
        <option value="ready-to-submit">
          Ready to Submit
        </option>
      </select>

      <select
        value={category}
        onChange={(event) =>
          onCategoryChange(event.target.value)
        }
        className="h-11 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 text-sm text-[var(--color-card-heading)] outline-none transition focus:border-[var(--color-accent)]"
      >
        <option value="all">All categories</option>

        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={collaboration}
        onChange={(event) =>
          onCollaborationChange(
            event.target.value as
              | 'all'
              | 'solo'
              | 'collaborative',
          )
        }
        className="h-11 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 text-sm text-[var(--color-card-heading)] outline-none transition focus:border-[var(--color-accent)]"
      >
        <option value="all">All collaboration</option>
        <option value="solo">Solo Articles</option>
        <option value="collaborative">
          Collaborative Articles
        </option>
      </select>
    </div>
  )
}

