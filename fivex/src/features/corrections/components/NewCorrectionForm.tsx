import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { articlesApi } from '@/features/authors/api/articles.api'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { CATEGORY_LABELS, type CorrectionCategory, type CreateCorrectionInput } from '../types/correction.types'

interface NewCorrectionFormProps {
  isSaving: boolean
  error?: unknown
  onSubmit: (input: CreateCorrectionInput) => Promise<unknown>
}

const INPUT_CLASS =
  'w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border'

// Lets an editor log an error they spotted themselves, straight into the queue.
export function NewCorrectionForm({ isSaving, error, onSubmit }: NewCorrectionFormProps) {
  const { data: articles = [] } = useQuery({
    queryKey: ['articles', 'published-for-corrections'],
    queryFn: articlesApi.listPublished,
  })

  const [articleId, setArticleId] = useState('')
  const [category, setCategory] = useState<CorrectionCategory>('factual-error')
  const [description, setDescription] = useState('')
  const [suggestedFix, setSuggestedFix] = useState('')
  const [evidence, setEvidence] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setDone(false)
    try {
      await onSubmit({
        articleId,
        category,
        description: description.trim(),
        suggestedFix: suggestedFix.trim() || undefined,
        evidenceLinks: evidence
          .split('\n')
          .map((link) => link.trim())
          .filter(Boolean),
      })
      setArticleId('')
      setDescription('')
      setSuggestedFix('')
      setEvidence('')
      setDone(true)
    } catch {
      // surfaced through `error`
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-4 max-w-3xl">
      <h2 className="text-sm font-semibold text-card-heading">Log a correction request</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-card-text-muted" htmlFor="correction-article">
            Article
          </label>
          <select
            id="correction-article"
            value={articleId}
            onChange={(event) => setArticleId(event.target.value)}
            required
            className={INPUT_CLASS}
          >
            <option value="">Choose a published article</option>
            {articles.map((article) => (
              <option key={article.id} value={article.id}>
                {article.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-card-text-muted" htmlFor="correction-category">
            Type of error
          </label>
          <select
            id="correction-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as CorrectionCategory)}
            className={INPUT_CLASS}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-card-text-muted" htmlFor="correction-description">
          What is wrong?
        </label>
        <textarea
          id="correction-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          minLength={10}
          maxLength={2000}
          rows={3}
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-card-text-muted" htmlFor="correction-fix">
          Suggested fix <span className="text-card-text-dim">(optional)</span>
        </label>
        <textarea
          id="correction-fix"
          value={suggestedFix}
          onChange={(event) => setSuggestedFix(event.target.value)}
          maxLength={2000}
          rows={2}
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-card-text-muted" htmlFor="correction-evidence">
          Evidence links <span className="text-card-text-dim">(optional, one per line)</span>
        </label>
        <textarea
          id="correction-evidence"
          value={evidence}
          onChange={(event) => setEvidence(event.target.value)}
          rows={2}
          placeholder="https://example.com/source"
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSaving || !articleId || description.trim().length < 10}
          className="px-4 py-2 rounded-lg bg-brand-gradient text-on-brand text-sm font-medium transition-colors disabled:opacity-50"
        >
          Add to queue
        </button>
        {done && <p className="text-xs text-verified">Added to the corrections queue.</p>}
        {error != null && <p className="text-xs text-disputed">{getErrorMessage(error)}</p>}
      </div>
    </form>
  )
}
