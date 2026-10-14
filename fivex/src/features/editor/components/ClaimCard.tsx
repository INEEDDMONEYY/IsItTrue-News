import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flag, Lock, Plus, RotateCcw, Save, ShieldAlert, Trash2, UserCheck, X } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import {
  CLAIM_STATUSES,
  EVIDENCE_STATUSES,
  claimStatusLabels,
  evidenceStanceLabels,
  evidenceStatusLabels,
  reliabilityLabels,
  type Claim,
  type ClaimStatus,
  type ClaimUpdate,
  type EvidenceStance,
  type EvidenceStatus,
  type NewEvidence,
  type SourceReliability,
} from '../types/claim.types'

// Only a conclusion that the claim is contradicted is red. "Unverified" and "unable to verify" mean the claim
// couldn't be confirmed, which is not the same as having shown it false, so they are neutral.
const statusTone: Record<ClaimStatus, string> = {
  unreviewed: 'bg-card text-text-muted border-border',
  in_review: 'bg-pending/10 text-pending border-pending/30',
  verified: 'bg-verified/10 text-verified border-verified/30',
  partially_supported: 'bg-accent/10 text-accent border-accent-border',
  disputed: 'bg-disputed/10 text-disputed border-disputed/30',
  unverified: 'bg-card text-text-muted border-border',
  unable_to_verify: 'bg-card text-text-muted border-border',
}

const fieldClass =
  'mt-1 block w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-heading'

const NARRATIVE = [
  { key: 'conclusion', label: 'Conclusion', rows: 2, max: 1000 },
  { key: 'reasoning', label: 'Reasoning', rows: 3, max: 4000 },
  { key: 'limitations', label: 'Limitations', rows: 2, max: 2000 },
  { key: 'uncertainty', label: 'What is still uncertain', rows: 2, max: 2000 },
] as const

function parseSources(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

const isWebUrl = (value: string | undefined): value is string => Boolean(value && /^https?:\/\//i.test(value))
const isConcluding = (status: ClaimStatus) => status !== 'unreviewed' && status !== 'in_review'

interface ClaimCardProps {
  claim: Claim
  currentUserId: string | undefined
  onSave: (changes: ClaimUpdate) => Promise<unknown>
  onDelete: () => Promise<unknown>
  onTake: () => Promise<unknown>
  onAddEvidence: (input: NewEvidence) => Promise<unknown>
  onRemoveEvidence: (itemId: string) => Promise<unknown>
  isSaving: boolean
}

function Notice({ icon: Icon, tone, children }: { icon: typeof Flag; tone: 'amber' | 'red'; children: React.ReactNode }) {
  return (
    <div
      role="note"
      className={`mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm ${
        tone === 'red' ? 'border-disputed/30 bg-disputed/10' : 'border-pending/30 bg-pending/10'
      }`}
    >
      <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${tone === 'red' ? 'text-disputed' : 'text-pending'}`} />
      <div className="min-w-0 text-card-text break-words">{children}</div>
    </div>
  )
}

export function ClaimCard({ claim, currentUserId, onSave, onDelete, onTake, onAddEvidence, onRemoveEvidence, isSaving }: ClaimCardProps) {
  const [status, setStatus] = useState<ClaimStatus>(claim.status)
  const [evidenceStatus, setEvidenceStatus] = useState<EvidenceStatus>(claim.evidenceStatus)
  const [summary, setSummary] = useState(claim.evidenceSummary ?? '')
  const [sources, setSources] = useState(claim.sources.join('\n'))
  const [narrative, setNarrative] = useState({
    conclusion: claim.assessment?.conclusion ?? '',
    reasoning: claim.assessment?.reasoning ?? '',
    limitations: claim.assessment?.limitations ?? '',
    uncertainty: claim.assessment?.uncertainty ?? '',
  })
  const [error, setError] = useState<string | null>(null)

  // Only the responsible account can change a claim, so credit always matches who did the work.
  const isMine = Boolean(currentUserId) && claim.assignee?.id === currentUserId
  // An escalated claim is on hold for everyone until an admin resolves it.
  const onHold = claim.workflowStatus === 'escalated'
  const canEdit = isMine && !onHold

  const statusChanged = status !== claim.status
  // A new conclusion takes whatever reasoning is written; an unchanged one only sends what was edited.
  const narrativeChanges = NARRATIVE.filter(({ key }) =>
    !isConcluding(status) ? false : statusChanged ? Boolean(narrative[key].trim()) : narrative[key].trim() !== (claim.assessment?.[key] ?? ''),
  )

  const changed =
    statusChanged ||
    evidenceStatus !== claim.evidenceStatus ||
    summary.trim() !== (claim.evidenceSummary ?? '') ||
    parseSources(sources).join('\n') !== claim.sources.join('\n') ||
    narrativeChanges.length > 0

  const run = async (action: () => Promise<unknown>, fallback: string) => {
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err, fallback))
    }
  }

  const save = () => {
    const changes: ClaimUpdate = {
      status,
      evidenceStatus,
      evidenceSummary: summary.trim(),
      sources: parseSources(sources),
    }
    for (const { key } of narrativeChanges) changes[key] = narrative[key].trim()
    return run(() => onSave(changes), 'Couldn’t save this claim.')
  }

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

      {onHold && (
        <Notice icon={ShieldAlert} tone="red">
          <strong>On hold.</strong> An admin has escalated this claim, so it can&apos;t be edited or taken over until they resolve it.
        </Notice>
      )}
      {claim.returnReason && (
        <Notice icon={RotateCcw} tone="amber">
          <strong>Returned by an admin for another look:</strong> {claim.returnReason}
        </Notice>
      )}
      {claim.evidenceFlag && (
        <Notice icon={Flag} tone="amber">
          <strong>An admin flagged the evidence as incomplete:</strong> {claim.evidenceFlag.reason}
        </Notice>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-text-muted">
          Status
          <select
            className={fieldClass}
            value={status}
            disabled={!canEdit}
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
            disabled={!canEdit}
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
            disabled={!canEdit}
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
            disabled={!canEdit}
            onChange={(e) => setSources(e.target.value)}
            placeholder="https://…"
          />
        </label>
      </div>

      {isConcluding(status) && (
        <fieldset className="mt-3 grid gap-3 md:grid-cols-2" disabled={!canEdit}>
          <legend className="mb-1 text-xs font-medium text-text-muted">
            Why you reached this conclusion. If it is &ldquo;{claimStatusLabels[status]}&rdquo; because the evidence wasn&apos;t there, say so;
            that is an honest outcome, not a finding that the claim is false.
          </legend>
          {NARRATIVE.map(({ key, label, rows, max }) => (
            <label key={key} className="block text-xs font-medium text-text-muted">
              {label}
              <textarea
                className={fieldClass}
                rows={rows}
                maxLength={max}
                value={narrative[key]}
                onChange={(e) => setNarrative((current) => ({ ...current, [key]: e.target.value }))}
              />
            </label>
          ))}
        </fieldset>
      )}

      <EvidenceItems claim={claim} canEdit={canEdit} onAdd={onAddEvidence} onRemove={onRemoveEvidence} onError={setError} />

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
                disabled={isSaving || onHold}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-disputed disabled:opacity-50"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={!changed || isSaving || onHold}
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
              disabled={isSaving || !currentUserId || onHold}
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

// The structured evidence behind a claim. Admins can restrict an item, in which case only a placeholder is shown.
function EvidenceItems({
  claim,
  canEdit,
  onAdd,
  onRemove,
  onError,
}: {
  claim: Claim
  canEdit: boolean
  onAdd: (input: NewEvidence) => Promise<unknown>
  onRemove: (itemId: string) => Promise<unknown>
  onError: (message: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [stance, setStance] = useState<EvidenceStance>('supporting')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [citation, setCitation] = useState('')
  const [reliability, setReliability] = useState<SourceReliability>('unknown')
  const [note, setNote] = useState('')

  const ready = title.trim() && (url.trim() || citation.trim())

  const add = async () => {
    onError(null)
    try {
      await onAdd({
        stance,
        title: title.trim(),
        reliability,
        ...(url.trim() ? { url: url.trim() } : {}),
        ...(citation.trim() ? { citation: citation.trim() } : {}),
        ...(note.trim() ? { reliabilityNote: note.trim() } : {}),
      })
      setOpen(false)
      setTitle('')
      setUrl('')
      setCitation('')
      setNote('')
      setReliability('unknown')
    } catch (err) {
      onError(getErrorMessage(err, 'Couldn’t add this evidence.'))
    }
  }

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-card-text-muted">Evidence items</h3>
      {claim.evidence.length === 0 && <p className="mt-1 text-xs text-card-text-muted">None added yet.</p>}
      <ul className="mt-2 flex flex-col gap-2">
        {claim.evidence.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-card-border bg-card-2 p-2.5 text-sm">
            {item.restricted ? (
              <p className="inline-flex items-center gap-1.5 text-card-text-muted">
                <Lock aria-hidden="true" className="size-3.5" />
                {evidenceStanceLabels[item.stance]} evidence restricted by an admin
              </p>
            ) : (
              <div className="min-w-0">
                <p className="break-words font-medium text-card-heading">
                  <span className="mr-1.5 text-xs font-normal text-card-text-muted">{evidenceStanceLabels[item.stance]}</span>
                  {item.title}
                </p>
                {item.url &&
                  (isWebUrl(item.url) ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="break-all text-xs text-accent hover:underline">
                      {item.url}
                    </a>
                  ) : (
                    <span className="break-all text-xs">{item.url}</span>
                  ))}
                {item.citation && <p className="break-words text-xs text-card-text">{item.citation}</p>}
                <p className="text-xs text-card-text-muted">
                  {item.reliability ? reliabilityLabels[item.reliability] : ''}
                  {item.reliabilityNote ? `: ${item.reliabilityNote}` : ''}
                </p>
              </div>
            )}
            {canEdit && !item.restricted && (
              <button
                type="button"
                aria-label={`Remove evidence: ${item.title}`}
                onClick={() => void onRemove(item.id).catch((err) => onError(getErrorMessage(err, 'Couldn’t remove this evidence.')))}
                className="shrink-0 rounded p-1 text-text-muted hover:text-disputed"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {canEdit &&
        (open ? (
          <div className="mt-3 grid gap-3 rounded-lg border border-card-border p-3 md:grid-cols-2">
            <label className="block text-xs font-medium text-text-muted">
              What it shows
              <select className={fieldClass} value={stance} onChange={(e) => setStance(e.target.value as EvidenceStance)}>
                {(Object.keys(evidenceStanceLabels) as EvidenceStance[]).map((value) => (
                  <option key={value} value={value}>{evidenceStanceLabels[value]}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-text-muted">
              Title
              <input className={fieldClass} value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-text-muted">
              Link
              <input className={fieldClass} value={url} placeholder="https://…" onChange={(e) => setUrl(e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-text-muted">
              Citation (if there is no link)
              <input className={fieldClass} value={citation} maxLength={1000} onChange={(e) => setCitation(e.target.value)} />
            </label>
            <label className="block text-xs font-medium text-text-muted">
              How reliable is the source?
              <select className={fieldClass} value={reliability} onChange={(e) => setReliability(e.target.value as SourceReliability)}>
                {(Object.keys(reliabilityLabels) as SourceReliability[]).map((value) => (
                  <option key={value} value={value}>{reliabilityLabels[value]}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-text-muted">
              Why (reliability note)
              <input className={fieldClass} value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} />
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button
                type="button"
                onClick={() => void add()}
                disabled={!ready}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-3 py-2 text-sm font-medium text-on-brand disabled:opacity-50"
              >
                <Plus aria-hidden="true" className="size-4" />
                Add evidence
              </button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-card-heading hover:border-accent-border hover:text-accent"
          >
            <Plus aria-hidden="true" className="size-3.5" />
            Add evidence
          </button>
        ))}
    </div>
  )
}
