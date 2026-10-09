import { useState, type FormEvent } from 'react'
import { Megaphone } from 'lucide-react'
import { useTopicSubmissions } from '../hooks/useTopicSubmissions'
import { getErrorMessage } from '@/lib/getErrorMessage'

const CATEGORY_OPTIONS = [
  'Politics',
  'Crime',
  'Environment',
  'Tech',
  'Local News',
  'Business',
  'Health',
  'Science',
  'Other',
]

export function TopicSubmissionPage() {
  const { submissions, isLoading, submitTopic, isSubmitting } = useTopicSubmissions()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await submitTopic({
        title: title.trim(),
        description: description.trim(),
        category: category || undefined,
      })
      setTitle('')
      setCategory('')
      setDescription('')
      setSubmitted(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit your topic. Please try again.'))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Topic Submission</h1>
      <p className="text-sm text-text-muted mb-6">
        Have a story or topic you think we should cover? Let our newsroom know.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl mb-10">
        <div>
          <label className="block text-xs text-text-muted mb-1.5" htmlFor="title">
            Topic title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setSubmitted(false)
            }}
            placeholder="What should we cover?"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          >
            <option value="">Select a category (optional)</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5" htmlFor="description">
            Tell us more
          </label>
          <textarea
            id="description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share as much detail as you can — what happened, who's involved, and why it matters"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !description.trim()}
          className="self-start inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-gradient text-on-brand text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Megaphone className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : 'Submit topic'}
        </button>

        {submitted && <p className="text-sm text-verified">Thanks — your topic has been submitted.</p>}
        {error && <p className="text-sm text-disputed">{error}</p>}
      </form>

      <div>
        <h2 className="text-sm font-semibold text-heading mb-3">Your submissions</h2>

        {isLoading ? (
          <p className="text-sm text-text-muted">Loading...</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-text-muted">You haven't submitted any topics yet.</p>
        ) : (
          <ul className="flex flex-col gap-2 max-w-2xl">
            {submissions.map((submission) => (
              <li
                key={submission.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-card-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-card-heading">{submission.title}</p>
                  {submission.category && (
                    <p className="text-xs text-card-text-dim mt-0.5">{submission.category}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                    submission.status === 'reviewed'
                      ? 'bg-verified/10 text-verified'
                      : 'bg-pending/10 text-pending'
                  }`}
                >
                  {submission.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
