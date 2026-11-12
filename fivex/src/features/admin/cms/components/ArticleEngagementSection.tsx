import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Save } from 'lucide-react'
import { useAdminArticles, useSetArticleEngagement } from '@/features/admin/articles/hooks/useAdminArticles'
import type { AdminArticleRow } from '@/features/admin/articles/types/adminArticle.types'
import { PageLoader } from '@/components/loaders/PageLoader'
import { getErrorMessage } from '@/lib/getErrorMessage'

const PAGE_SIZE = 10
const MAX_COUNT = 1_000_000_000

// Returns the whole number typed, or null when the value isn't a count the server would accept.
function parseCount(value: string): number | null {
  if (value.trim() === '') return null
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 && number <= MAX_COUNT ? number : null
}

function EngagementRow({ article }: { article: AdminArticleRow }) {
  const [likes, setLikes] = useState(String(article.likes))
  const [dislikes, setDislikes] = useState(String(article.dislikes))
  const [rowError, setRowError] = useState<string | null>(null)
  const mutation = useSetArticleEngagement(article.id)

  const parsedLikes = parseCount(likes)
  const parsedDislikes = parseCount(dislikes)
  const unchanged = parsedLikes === article.likes && parsedDislikes === article.dislikes
  const canSave = parsedLikes !== null && parsedDislikes !== null && !unchanged && !mutation.isPending

  const handleSave = async () => {
    if (parsedLikes === null || parsedDislikes === null) return
    setRowError(null)
    try {
      await mutation.mutateAsync({ likes: parsedLikes, dislikes: parsedDislikes })
    } catch (err) {
      setRowError(getErrorMessage(err, 'Failed to save engagement.'))
    }
  }

  const inputClass =
    'w-24 rounded-lg border border-card-border bg-card-2 px-2 py-1.5 text-sm text-card-heading outline-none focus:border-accent'

  return (
    <li className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-card-heading truncate">{article.title}</p>
        <p className="text-xs text-card-text-muted">{article.category}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-card-text-muted">
          <ThumbsUp className="w-3.5 h-3.5" />
          Likes
          <input
            type="number"
            min={0}
            step={1}
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-card-text-muted">
          <ThumbsDown className="w-3.5 h-3.5" />
          Dislikes
          <input
            type="number"
            min={0}
            step={1}
            value={dislikes}
            onChange={(e) => setDislikes(e.target.value)}
            className={inputClass}
          />
        </label>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-gradient text-on-brand transition-colors disabled:opacity-40"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
      {(rowError || (likes !== '' && parsedLikes === null) || (dislikes !== '' && parsedDislikes === null)) && (
        <p className="text-xs text-disputed md:basis-full">
          {rowError ?? `Enter whole numbers from 0 to ${MAX_COUNT.toLocaleString()}.`}
        </p>
      )}
    </li>
  )
}

export function ArticleEngagementSection() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useAdminArticles({
    status: 'published',
    sort: 'createdAt',
    order: 'desc',
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <section>
      <h2 className="text-lg font-semibold text-heading mb-1">Article engagement</h2>
      <p className="text-sm text-text-muted mb-4">
        Set the likes and dislikes shown to readers on published articles. Changes are recorded in each article's history.
      </p>

      <div className="rounded-2xl border border-card-border bg-card px-5">
        {isLoading && <PageLoader label="Loading articles..." />}
        {error && <p className="py-4 text-sm text-disputed">{getErrorMessage(error, 'Failed to load articles.')}</p>}
        {data && data.articles.length === 0 && (
          <p className="py-4 text-sm text-card-text-muted">No published articles yet.</p>
        )}
        {data && data.articles.length > 0 && (
          <ul className="divide-y divide-card-border">
            {data.articles.map((article) => (
              <EngagementRow key={article.id} article={article} />
            ))}
          </ul>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 mt-4 text-sm text-card-text-muted">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-card-border disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(data.totalPages, current + 1))}
            disabled={page >= data.totalPages}
            className="px-3 py-1.5 rounded-lg border border-card-border disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}
