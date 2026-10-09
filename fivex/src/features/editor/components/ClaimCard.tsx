import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Save, Trash2, UserCheck } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import {
  CLAIM_STATUSES,
  EVIDENCE_STATUSES,
  claimStatusLabels,
  evidenceStatusLabels,
  type Claim,
  type ClaimStatus,
  type ClaimUpdate,
  type EvidenceStatus,
} from '../types/claim.types'

const statusTone: Record<ClaimStatus, string> = {
  unreviewed: 'bg-card text-text-muted border-border',
  in_review: 'bg-pending/10 text-pending border-pending/30',
  verified: 'bg-verified/10 text-verified border-verified/30',
  partially_supported: 'bg-accent/10 text-accent border-accent-border',
  disputed: 'bg-disputed/10 text-disputed border-disputed/30',
  unverified: 'bg-disputed/10 text-disputed border-disputed/30',
  unable_to_verify: 'bg-card text-text-muted border-border',
}

const fieldClass =
  'mt-1 block w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-heading'

function parseSources(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

interface ClaimCardProps {
  claim: Claim
  currentUserId: string | undefined
  onSave: (changes: ClaimUpdate) => Promise<unknown>
  onDelete: () => Promise<unknown>
  onTake: () => Promise<unknown>
  isSaving: boolean
}

export function ClaimCard({ claim, currentUserId, onSave, onDelete, onTake, isSaving }: ClaimCardProps) {
  const [status, setStatus] = useState<ClaimStatus>(claim.status)
  const [evidenceStatus, setEvidenceStatus] = useState<EvidenceStatus>(claim.evidenceStatus)
  const [summary, setSummary] = useState(claim.evidenceSummary ?? '')
  const [sources, setSources] = useState(claim.sources.join('\n'))
  const [error, setError] = useState<string | null>(null)

  // Only the responsible account can change a claim, so credit always matches who did the work.
  const isMine = Boolean(currentUserId) && claim.assignee?.id === currentUserId

  const changed =
    status !== claim.status ||
    evidenceStatus !== claim.evidenceStatus ||
    summary.trim() !== (claim.evidenceSummary ?? '') ||
    parseSources(sources).join('\n') !== claim.sources.join('\n')

  const run = async (action: () => Promise<unknown>, fallback: string) => {
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err, fallback))
    }
  }

  const save = () =>
    run(
      () =>
        onSave({
          status,
          evidenceStatus,
          evidenceSummary: summary.trim(),
          sources: parseSources(sources),
        }),
      'Couldn’t save this claim.',
    )

  const remove = () => {
    if (!window.confirm('Delete this claim? This can’t be undone.')) return
    void run(onDelete, 'Couldn’t delete this claim.')
  }

  return (
    <article className="rounded-xl border border-card-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-card-heading">“{claim.text}”</p>
          <p className="mt-1 text-xs text-card-text-muted">
            In{' '}
            {claim.article ? (
              <Link to={`/article/${claim.article.slug}`} className="text-accent hover:underline">
                {claim.article.title}
              </Link>
            ) : (
              'a deleted article'
            )}
            {' · '}
            {claim.assignee?.name
              ? `Responsible: ${isMine ? 'You' : claim.assignee.name}`
              : 'No one is responsible yet'}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone[claim.status]}`}>
          {claimStatusLabels[claim.status]}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-text-muted">
          Status
          <select
            className={fieldClass}
            value={status}
            disabled={!isMine}
            onChange={(e) => setStatus(e.target.value as ClaimStatus)}
          >
            {CLAIM_STATUSES.map((value) => (
              <option key={value} value={value}>{claimStatusLabels[value]}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-text-muted">
          Evidence status
          <select
            className={fieldClass}
            value={evidenceStatus}
            disabled={!isMine}
            onChange={(e) => setEvidenceStatus(e.target.value as EvidenceStatus)}
          >
            {EVIDENCE_STATUSES.map((value) => (
              <option key={value} value={value}>{evidenceStatusLabels[value]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="block text-xs font-medium text-text-muted">
          Evidence summary
          <textarea
            className={fieldClass}
            rows={3}
            maxLength={2000}
            value={summary}
            disabled={!isMine}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What the evidence shows so far"
          />
        </label>
        <label className="block text-xs font-medium text-text-muted">
          Sources (one URL per line)
          <textarea
            className={fieldClass}
            rows={3}
            value={sources}
            disabled={!isMine}
            onChange={(e) => setSources(e.target.value)}
            placeholder="https://…"
          />
        </label>
      </div>

      {error && <p role="alert" className="mt-3 text-sm text-disputed">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-card-text-muted">
          {claim.reviewedAt && claim.reviewedBy?.name
            ? `Decided by ${claim.reviewedBy.name} on ${new Date(claim.reviewedAt).toLocaleDateString()}`
            : `Added ${new Date(claim.createdAt).toLocaleDateString()}`}
        </p>
        <div className="flex gap-2">
          {isMine ? (
            <>
              <button
                type="button"
                onClick={remove}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-disputed disabled:opacity-50"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={!changed || isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-3 py-2 text-sm font-medium text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save aria-hidden="true" className="size-4" />
                Save
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void run(onTake, 'Couldn’t take responsibility for this claim.')}
              disabled={isSaving || !currentUserId}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-3 py-2 text-sm font-medium text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserCheck aria-hidden="true" className="size-4" />
              {claim.assignee?.name ? `Take over from ${claim.assignee.name}` : 'Take responsibility'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
