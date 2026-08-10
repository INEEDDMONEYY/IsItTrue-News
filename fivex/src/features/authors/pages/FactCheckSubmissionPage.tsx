import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useAuthorArticles } from '../hooks/useAuthorArticles'
import { useFactCheckRequests } from '../hooks/useFactCheckRequests'
import { articlesApi } from '../api/articles.api'
import { getErrorMessage } from '@/lib/getErrorMessage'

export function FactCheckSubmissionPage() {
  const { user } = useAuth()
  const isEditor = user?.role === 'editor'

  // Authors request fact checks for their own work; editors don't author
  // articles here, so they pick from the published feed instead.
  const { articles: myArticles } = useAuthorArticles()
  const { data: publishedArticles } = useQuery({
    queryKey: ['articles', 'published'],
    queryFn: articlesApi.listPublished,
    enabled: isEditor,
  })
  const articles = isEditor ? publishedArticles ?? [] : myArticles

  const { requests, submitRequest } = useFactCheckRequests()

  // An article can only have one fact-check request in flight at a time —
  // the backend enforces this too, but filtering here keeps the dropdown
  // relevant.
  const pendingArticleIds = new Set(
    requests.filter((r) => r.status === 'pending').map((r) => r.article.id),
  )
  const eligibleArticles = articles.filter((a) => !pendingArticleIds.has(a.id))

  const [articleId, setArticleId] = useState(eligibleArticles[0]?.id ?? '')
  const [claim, setClaim] = useState('')
  const [sources, setSources] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedArticle = eligibleArticles.find((a) => a.id === articleId) ?? eligibleArticles[0]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedArticle) return
    setError(null)
    setIsSubmitting(true)
    try {
      await submitRequest({
        articleId: selectedArticle.id,
        claim: claim.trim(),
        sources: sources.trim(),
        notes: notes.trim(),
      })
      setClaim('')
      setSources('')
      setNotes('')
      setSubmitted(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit fact-check request.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Fact Checks</h1>
      <p className="text-sm text-text-muted mb-6">
        Request verification from the IsItTrue Fact-Check Team for one of your articles. This
        doesn&apos;t discredit you — it&apos;s an added layer of verification readers can trust.
      </p>

      {eligibleArticles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-card-border bg-card p-8 text-center text-sm text-card-text-muted max-w-2xl">
          {articles.length === 0
            ? 'Create an article before requesting a fact check.'
            : 'All of your articles already have a fact-check request awaiting review.'}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
          <div>
            <label className="block text-xs text-text-muted mb-1.5" htmlFor="article">
              Article
            </label>
            <select
              id="article"
              value={selectedArticle?.id ?? ''}
              onChange={(e) => {
                setArticleId(e.target.value)
                setSubmitted(false)
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
            >
              {eligibleArticles.map((article) => (
                <option key={article.id} value={article.id}>
                  {article.title || 'Untitled'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5" htmlFor="claim">
              Claim to verify
            </label>
            <textarea
              id="claim"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              rows={2}
              required
              placeholder="The specific claim or statistic you'd like the Fact-Check Team to verify"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5" htmlFor="sources">
              Sources
            </label>
            <textarea
              id="sources"
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              rows={3}
              required
              placeholder="List the public records, interviews, or datasets you used"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5" htmlFor="notes">
              Summary
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              required
              placeholder="Explain your findings in a few sentences for the reviewing admin"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!notes.trim() || !claim.trim() || !sources.trim() || isSubmitting}
            className="self-start inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit fact check'}
          </button>

          {error && <p className="text-sm text-disputed">{error}</p>}
          {submitted && (
            <p className="text-sm text-verified">
              Sent to the IsItTrue Fact-Check Team for review.
            </p>
          )}
        </form>
      )}
    </div>
  )
}

