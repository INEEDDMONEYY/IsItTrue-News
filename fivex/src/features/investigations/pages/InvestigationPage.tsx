import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, Plus, Trash2 } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { useAuth } from '@/app/providers/AuthProvider'
import { Spinner } from '@/components/ui/Spinner'
import { PageLoader } from '@/components/loaders/PageLoader'
import { RichTextEditor } from '@/features/authors/components/RichTextEditor'
import { useInvestigationDetail } from '@/features/authors/hooks/useInvestigationDetail'
import { useEvidenceVault } from '@/features/authors/hooks/useEvidenceVault'
import type { EvidenceKind } from '@/features/evidence/types/evidence.types'
import type { InvestigationStatus } from '../types/investigation.types'

const STATUS_STYLES: Record<InvestigationStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-card-2 text-card-text-muted border-card-border' },
  pending_review: { label: 'Pending Review', className: 'bg-pending/10 text-pending border-pending/30' },
  published: { label: 'Published', className: 'bg-verified/10 text-verified border-verified/30' },
  rejected: { label: 'Rejected', className: 'bg-disputed/10 text-disputed border-disputed/30' },
}

const EVIDENCE_KINDS: { value: EvidenceKind; label: string }[] = [
  { value: 'document', label: 'Document' },
  { value: 'photo', label: 'Photo' },
  { value: 'video', label: 'Video' },
  { value: 'note', label: 'Note' },
  { value: 'foia', label: 'FOIA Response' },
  { value: 'interview_transcript', label: 'Interview Transcript' },
]

// Notes/FOIA/interview transcripts can never be released publicly (enforced
// server-side too) — the Approve action is hidden for those kinds entirely.
const PUBLIC_ELIGIBLE_KINDS: EvidenceKind[] = ['document', 'photo', 'video']

export function InvestigationPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isPrivileged = user?.role === 'editor' || user?.role === 'admin'

  const {
    investigation,
    isLoading,
    updateInvestigation,
    isUpdating,
    submitForReview,
    isSubmitting,
    publish,
    reject,
    addTimelineEntry,
    isAddingTimelineEntry,
    removeTimelineEntry,
    addEditorComment,
    isAddingEditorComment,
  } = useInvestigationDetail(id)

  const {
    evidence,
    isLoading: isLoadingEvidence,
    uploadEvidence,
    isUploading,
    approveEvidence,
    revokeEvidence,
    removeEvidence,
  } = useEvidenceVault(id)

  const [title, setTitle] = useState('')
  const [subheadline, setSubheadline] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [hydrated, setHydrated] = useState(false)

  const [entryDate, setEntryDate] = useState('')
  const [entryTitle, setEntryTitle] = useState('')
  const [entryDescription, setEntryDescription] = useState('')
  const [entryVisibility, setEntryVisibility] = useState<'public' | 'internal'>('internal')

  const [commentDraft, setCommentDraft] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const [evidenceKind, setEvidenceKind] = useState<EvidenceKind>('document')
  const [evidenceTitle, setEvidenceTitle] = useState('')
  const [evidenceDescription, setEvidenceDescription] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [evidenceSource, setEvidenceSource] = useState('')

  if (isLoading) {
    return <PageLoader label="Loading investigation..." />
  }

  if (!investigation) {
    return (
      <div className="py-16 flex flex-col items-center text-center gap-3">
        <h1 className="text-2xl font-semibold text-heading">Investigation not found</h1>
        <Link to="/author/investigations" className="text-accent font-medium hover:underline text-sm">
          Back to My Investigations
        </Link>
      </div>
    )
  }

  // Populate the edit form once, the first time the investigation loads —
  // avoids clobbering in-progress edits on every background refetch.
  if (!hydrated) {
    setTitle(investigation.title)
    setSubheadline(investigation.subheadline ?? '')
    setSummary(investigation.summary)
    setCategory(investigation.category ?? '')
    setCoverImage(investigation.coverImage ?? '')
    setBodyHtml(investigation.bodyHtml ?? '')
    setInternalNotes(investigation.internalNotes ?? '')
    setHydrated(true)
  }

  const status = STATUS_STYLES[investigation.status]
  const canSubmit = investigation.status === 'draft' || investigation.status === 'rejected'
  const canPublishOrReject = isPrivileged && investigation.status === 'pending_review'

  async function handleSaveOverview(event: React.FormEvent) {
    event.preventDefault()
    await updateInvestigation({
      title,
      subheadline: subheadline || undefined,
      summary,
      category: category || undefined,
      coverImage: coverImage || undefined,
      bodyHtml: bodyHtml || undefined,
      internalNotes: internalNotes || undefined,
    })
  }

  async function handleAddTimelineEntry(event: React.FormEvent) {
    event.preventDefault()
    if (!entryDate || !entryTitle.trim() || !entryDescription.trim()) return
    await addTimelineEntry({
      date: entryDate,
      title: entryTitle.trim(),
      description: entryDescription.trim(),
      visibility: entryVisibility,
    })
    setEntryDate('')
    setEntryTitle('')
    setEntryDescription('')
    setEntryVisibility('internal')
  }

  async function handleAddEditorComment(event: React.FormEvent) {
    event.preventDefault()
    const message = commentDraft.trim()
    if (!message) return
    await addEditorComment(message)
    setCommentDraft('')
  }

  async function handleReject() {
    const reason = rejectionReason.trim()
    if (!reason) return
    await reject(reason)
    setRejectionReason('')
  }

  async function handleUploadEvidence(event: React.FormEvent) {
    event.preventDefault()
    if (!evidenceTitle.trim()) return
    await uploadEvidence({
      kind: evidenceKind,
      title: evidenceTitle.trim(),
      description: evidenceDescription.trim() || undefined,
      url: evidenceUrl.trim() || undefined,
      source: evidenceSource.trim() || undefined,
    })
    setEvidenceTitle('')
    setEvidenceDescription('')
    setEvidenceUrl('')
    setEvidenceSource('')
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <Link to="/author/investigations" className="text-sm text-text-muted hover:text-accent">
          ← Back to My Investigations
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-heading">{investigation.title}</h1>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${status.className}`}>
            {status.label}
          </span>
        </div>
        {investigation.status === 'rejected' && investigation.rejectionReason && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-disputed/30 bg-disputed/10 px-4 py-3 text-sm text-disputed">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{investigation.rejectionReason}</span>
          </div>
        )}
      </div>

      {/* Status actions */}
      <div className="flex flex-wrap items-center gap-3">
        {canSubmit && (
          <button
            type="button"
            onClick={() => submitForReview()}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting && <Spinner size="sm" className="border-white/40 border-t-white" />}
            Submit for Review
          </button>
        )}
        {canPublishOrReject && (
          <>
            <button
              type="button"
              onClick={() => publish()}
              className="rounded-xl bg-verified px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Publish
            </button>
            <div className="flex items-center gap-2">
              <input
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Reason for rejection"
                className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-card-text focus:border-accent-border focus:outline-none"
              />
              <button
                type="button"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="rounded-xl border border-disputed/30 bg-disputed/10 px-4 py-2 text-sm font-semibold text-disputed disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </>
        )}
      </div>

      {/* Overview */}
      <form onSubmit={handleSaveOverview} className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-heading">Overview</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-heading">Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-card-text focus:border-accent-border focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-heading">Subheadline</label>
          <input
            value={subheadline}
            onChange={(event) => setSubheadline(event.target.value)}
            className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-card-text focus:border-accent-border focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-heading">Public summary</label>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={3}
            className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-card-text focus:border-accent-border focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-heading">Category</label>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-card-text focus:border-accent-border focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-heading">Cover image URL</label>
            <input
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-card-text focus:border-accent-border focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-heading">Full body (published version)</label>
          <RichTextEditor value={bodyHtml} onChange={setBodyHtml} placeholder="Write the full investigation..." />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-heading">
            Internal notes <span className="font-normal text-text-dim">(never shown to readers)</span>
          </label>
          <textarea
            value={internalNotes}
            onChange={(event) => setInternalNotes(event.target.value)}
            rows={3}
            className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-card-text focus:border-accent-border focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="self-start flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating && <Spinner size="sm" className="border-white/40 border-t-white" />}
          Save Changes
        </button>
      </form>

      {/* Timeline */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-heading">Timeline</h2>

        {investigation.timeline.length > 0 && (
          <ul className="flex flex-col gap-3">
            {investigation.timeline.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-card-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-xs font-medium text-text-dim">
                    {dayjs(entry.date).format('MMM D, YYYY')} ·{' '}
                    {entry.visibility === 'public' ? 'Public' : 'Internal only'}
                  </p>
                  <p className="text-sm font-semibold text-card-heading">{entry.title}</p>
                  <p className="text-sm text-card-text-muted">{entry.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeTimelineEntry(entry.id)}
                  className="shrink-0 text-card-text-dim hover:text-disputed"
                  aria-label="Remove timeline entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddTimelineEntry} className="flex flex-col gap-3 rounded-xl border border-card-border bg-surface p-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={entryDate}
              onChange={(event) => setEntryDate(event.target.value)}
              className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-card-text focus:border-accent-border focus:outline-none"
            />
            <select
              value={entryVisibility}
              onChange={(event) => setEntryVisibility(event.target.value as 'public' | 'internal')}
              className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-card-text focus:border-accent-border focus:outline-none"
            >
              <option value="internal">Internal only</option>
              <option value="public">Public</option>
            </select>
          </div>
          <input
            value={entryTitle}
            onChange={(event) => setEntryTitle(event.target.value)}
            placeholder="Entry title"
            className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-card-text focus:border-accent-border focus:outline-none"
          />
          <textarea
            value={entryDescription}
            onChange={(event) => setEntryDescription(event.target.value)}
            placeholder="What happened at this point in the investigation?"
            rows={2}
            className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-card-text focus:border-accent-border focus:outline-none resize-none"
          />
          <button
            type="submit"
            disabled={isAddingTimelineEntry}
            className="self-start flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </button>
        </form>
      </div>

      {/* Evidence Vault (scoped to this investigation) */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-heading">Evidence Vault</h2>

        {isLoadingEvidence ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {evidence.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-card-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-card-heading">{item.title}</p>
                  <p className="text-xs text-card-text-muted">
                    {item.kind} · {item.visibility === 'public' ? 'Public (approved)' : 'Private'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs font-medium">
                  {isPrivileged && item.visibility === 'private' && PUBLIC_ELIGIBLE_KINDS.includes(item.kind) && (
                    <button type="button" onClick={() => approveEvidence(item.id)} className="text-verified hover:underline">
                      Approve
                    </button>
                  )}
                  {isPrivileged && item.visibility === 'public' && (
                    <button type="button" onClick={() => revokeEvidence(item.id)} className="text-pending hover:underline">
                      Revoke
                    </button>
                  )}
                  <button type="button" onClick={() => removeEvidence(item.id)} className="text-disputed hover:underline">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleUploadEvidence} className="flex flex-col gap-3 rounded-xl border border-card-border bg-surface p-4">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={evidenceKind}
              onChange={(event) => setEvidenceKind(event.target.value as EvidenceKind)}
              className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-card-text focus:border-accent-border focus:outline-none"
            >
              {EVIDENCE_KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
            <input
              value={evidenceSource}
              onChange={(event) => setEvidenceSource(event.target.value)}
              placeholder="Source (optional)"
              className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-card-text focus:border-accent-border focus:outline-none"
            />
          </div>
          <input
            value={evidenceTitle}
            onChange={(event) => setEvidenceTitle(event.target.value)}
            placeholder="Evidence title"
            className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-card-text focus:border-accent-border focus:outline-none"
          />
          <textarea
            value={evidenceDescription}
            onChange={(event) => setEvidenceDescription(event.target.value)}
            placeholder="Description / notes"
            rows={2}
            className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-card-text focus:border-accent-border focus:outline-none resize-none"
          />
          <input
            value={evidenceUrl}
            onChange={(event) => setEvidenceUrl(event.target.value)}
            placeholder="File URL (optional)"
            className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-card-text focus:border-accent-border focus:outline-none"
          />
          <button
            type="submit"
            disabled={isUploading}
            className="self-start flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add to Vault
          </button>
        </form>
      </div>

      {/* Editorial comments (internal only) */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-heading">
          Editorial Comments <span className="font-normal text-text-dim">(internal only)</span>
        </h2>

        <div className="rounded-2xl border border-card-border bg-card px-5">
          {investigation.editorComments.length === 0 && (
            <p className="py-6 text-center text-sm text-card-text-dim">No editorial comments yet.</p>
          )}
          {investigation.editorComments.map((comment) => (
            <div key={comment.id} className="border-b border-card-border py-4 last:border-0">
              <p className="text-xs text-card-text-dim">{dayjs(comment.createdAt).format('MMM D, YYYY h:mm A')}</p>
              <p className="mt-1 text-sm text-card-text">{comment.message}</p>
            </div>
          ))}
        </div>

        {isPrivileged && (
          <form onSubmit={handleAddEditorComment} className="flex flex-col gap-2">
            <textarea
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder="Leave an internal note for the author..."
              rows={2}
              className="w-full resize-none rounded-xl border border-card-border bg-card px-4 py-3 text-sm text-card-text focus:border-accent-border focus:outline-none"
            />
            <button
              type="submit"
              disabled={isAddingEditorComment || !commentDraft.trim()}
              className="self-end rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Post Internal Comment
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
