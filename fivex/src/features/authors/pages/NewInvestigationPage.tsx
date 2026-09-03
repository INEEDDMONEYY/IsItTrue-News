import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaywallGate } from '@/features/billing/components/PaywallGate'
import { Spinner } from '@/components/ui/Spinner'
import { useInvestigationWorkspace } from '../hooks/useInvestigationWorkspace'

export function NewInvestigationPage() {
  return (
    <PaywallGate feature="investigations">
      <NewInvestigationForm />
    </PaywallGate>
  )
}

function NewInvestigationForm() {
  const navigate = useNavigate()
  const { createInvestigation, isCreating } = useInvestigationWorkspace()

  const [title, setTitle] = useState('')
  const [subheadline, setSubheadline] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    if (!title.trim() || !summary.trim()) {
      setError('Title and summary are required.')
      return
    }
    try {
      const investigation = await createInvestigation({
        title: title.trim(),
        subheadline: subheadline.trim() || undefined,
        summary: summary.trim(),
        category: category.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
      })
      navigate(`/author/investigations/${investigation.id}`)
    } catch {
      setError('Something went wrong creating this investigation. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-heading mb-1">New Investigation</h1>
      <p className="text-sm text-text-muted mb-6">
        Start a draft. You'll be able to add timeline entries, evidence, and collaborators before
        submitting it for editorial review.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-heading">Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-card-text focus:border-accent-border focus:outline-none"
            placeholder="e.g. The Missing Grant Funds"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-heading">Subheadline (optional)</label>
          <input
            value={subheadline}
            onChange={(event) => setSubheadline(event.target.value)}
            className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-card-text focus:border-accent-border focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-heading">Summary</label>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={4}
            className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-card-text focus:border-accent-border focus:outline-none resize-none"
            placeholder="A short public-facing summary of what this investigation is about."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-heading">Category (optional)</label>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-card-text focus:border-accent-border focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-heading">Cover image URL (optional)</label>
            <input
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-card-text focus:border-accent-border focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-disputed">{error}</p>}

        <button
          type="submit"
          disabled={isCreating}
          className="self-start flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreating && <Spinner size="sm" className="border-white/40 border-t-white" />}
          {isCreating ? 'Creating...' : 'Create Draft'}
        </button>
      </form>
    </div>
  )
}
