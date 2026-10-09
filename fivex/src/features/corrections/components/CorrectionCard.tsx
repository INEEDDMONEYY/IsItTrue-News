import { useState } from 'react'
import { ChevronDown, ExternalLink, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '@/lib/getErrorMessage'
import {
  CATEGORY_LABELS,
  HISTORY_LABELS,
  VERDICT_LABELS,
  type Correction,
  type InvestigationVerdict,
} from '../types/correction.types'

interface CorrectionCardProps {
  correction: Correction
  onStartInvestigation: (id: string) => Promise<unknown>
  onRecordFindings: (id: string, findings: string, verdict: InvestigationVerdict) => Promise<unknown>
  onPublish: (id: string, text: string) => Promise<unknown>
  onDismiss: (id: string, reason: string) => Promise<unknown>
}

const INPUT_CLASS =
  'w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border'

const BUTTON_CLASS =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors disabled:opacity-50'

export function CorrectionCard({
  correction,
  onStartInvestigation,
  onRecordFindings,
  onPublish,
  onDismiss,
}: CorrectionCardProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const [dismissReason, setDismissReason] = useState('')
  const [verdict, setVerdict] = useState<InvestigationVerdict>(correction.investigation?.verdict ?? 'confirmed')
  const [findings, setFindings] = useState(correction.investigation?.findings ?? '')
  const [noticeText, setNoticeText] = useState(correction.suggestedFix ?? '')

  const run = async (action: () => Promise<unknown>, fallback: string) => {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err, fallback))
    } finally {
      setBusy(false)
    }
  }

  const { status, investigation } = correction
  const findingsSaved = Boolean(investigation?.verdict)
  const canPublish = status === 'investigating' && (investigation?.verdict === 'confirmed' || investigation?.verdict === 'partially-confirmed')

  return (
    <article className="rounded-xl border border-card-border bg-card p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/article/${correction.articleSlug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-card-heading hover:text-accent break-words"
          >
            {correction.articleTitle}
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </Link>
          <span className="rounded-full border border-card-border bg-card-2 px-2 py-0.5 text-xs text-card-text-muted">
            {CATEGORY_LABELS[correction.category]}
          </span>
          {status === 'published' && correction.publication && (
            <span className="rounded-full border border-verified/30 bg-verified/10 px-2 py-0.5 text-xs text-verified">
              Correction {correction.publication.number}
            </span>
          )}
        </div>
        <p className="text-xs text-card-text-muted">
          Reported by {correction.reportedByName} · {new Date(correction.createdAt).toLocaleDateString()}
        </p>
      </div>

      <p className="text-sm text-card-text whitespace-pre-line break-words">{correction.description}</p>

      {correction.suggestedFix && (
        <p className="text-xs text-card-text-muted break-words">
          <span className="font-medium text-card-heading">Suggested fix: </span>
          {correction.suggestedFix}
        </p>
      )}

      {correction.evidenceLinks.length > 0 && (
        <ul className="space-y-1 text-xs">
          {correction.evidenceLinks.map((link) => (
            <li key={link} className="break-all">
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                {link}
              </a>
            </li>
          ))}
        </ul>
      )}

      {status === 'investigating' && investigation && (
        <div className="flex flex-col gap-3 rounded-lg border border-card-border p-3">
          <p className="text-xs text-card-text-muted">
            Investigated by {investigation.investigatorName} since{' '}
            {new Date(investigation.startedAt).toLocaleDateString()}
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-card-heading" htmlFor={`verdict-${correction.id}`}>
              Findings
            </label>
            <select
              id={`verdict-${correction.id}`}
              value={verdict}
              onChange={(event) => setVerdict(event.target.value as InvestigationVerdict)}
              className={INPUT_CLASS}
            >
              {Object.entries(VERDICT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <textarea
              value={findings}
              onChange={(event) => setFindings(event.target.value)}
              rows={3}
              maxLength={4000}
              placeholder="What did you check, and what did you find?"
              className={`${INPUT_CLASS} resize-none`}
            />
            <button
              type="button"
              disabled={busy || findings.trim().length === 0}
              onClick={() =>
                run(() => onRecordFindings(correction.id, findings.trim(), verdict), 'Failed to save findings.')
              }
              className={`${BUTTON_CLASS} w-fit border-card-border text-card-heading hover:bg-surface-2`}
            >
              Save findings
            </button>
          </div>

          {canPublish && (
            <div className="flex flex-col gap-2 border-t border-card-border pt-3">
              <label className="text-xs font-medium text-card-heading" htmlFor={`notice-${correction.id}`}>
                Correction notice shown to readers
              </label>
              <textarea
                id={`notice-${correction.id}`}
                value={noticeText}
                onChange={(event) => setNoticeText(event.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="e.g. An earlier version of this article misstated the date of the hearing. It was on 4 March."
                className={`${INPUT_CLASS} resize-none`}
              />
              <button
                type="button"
                disabled={busy || noticeText.trim().length < 10}
                onClick={() => run(() => onPublish(correction.id, noticeText.trim()), 'Failed to publish the correction.')}
                className={`${BUTTON_CLASS} w-fit border-verified/30 bg-verified/10 text-verified hover:bg-verified/20`}
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Publish correction
              </button>
            </div>
          )}
          {!canPublish && findingsSaved && (
            <p className="text-xs text-card-text-muted">
              The error wasn&apos;t confirmed, so there is nothing to publish. Dismiss this request if you&apos;re done.
            </p>
          )}
        </div>
      )}

      {status === 'published' && correction.publication && (
        <div className="rounded-lg border border-verified/30 bg-verified/10 p-3">
          <p className="text-sm text-card-text whitespace-pre-line break-words">{correction.publication.text}</p>
          <p className="mt-1 text-xs text-card-text-muted">
            Published by {correction.publication.publishedByName} on{' '}
            {new Date(correction.publication.publishedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {status === 'dismissed' && correction.dismissal && (
        <p className="text-xs text-card-text-muted break-words">
          Dismissed by {correction.dismissal.dismissedByName}: {correction.dismissal.reason}
        </p>
      )}

      {(status === 'queued' || status === 'investigating') && (
        <div className="flex flex-col gap-2">
          {dismissing ? (
            <div className="flex flex-col gap-2 rounded-lg border border-card-border p-3">
              <label className="text-xs font-medium text-card-heading" htmlFor={`dismiss-${correction.id}`}>
                Why is no correction needed?
              </label>
              <textarea
                id={`dismiss-${correction.id}`}
                value={dismissReason}
                onChange={(event) => setDismissReason(event.target.value)}
                rows={2}
                maxLength={500}
                className={`${INPUT_CLASS} resize-none`}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || dismissReason.trim().length === 0}
                  onClick={() => run(() => onDismiss(correction.id, dismissReason.trim()), 'Failed to dismiss.')}
                  className={`${BUTTON_CLASS} border-disputed bg-disputed text-white hover:opacity-90`}
                >
                  Dismiss request
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setDismissing(false)
                    setDismissReason('')
                  }}
                  className={`${BUTTON_CLASS} border-transparent text-card-text-muted hover:bg-surface-2`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {status === 'queued' && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => onStartInvestigation(correction.id), 'Failed to start the investigation.')}
                  className={`${BUTTON_CLASS} border-transparent bg-brand-gradient text-on-brand`}
                >
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Start investigation
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => setDismissing(true)}
                className={`${BUTTON_CLASS} border-disputed/30 bg-disputed/10 text-disputed hover:bg-disputed/20`}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-disputed">{error}</p>}

      <button
        type="button"
        onClick={() => setShowHistory((open) => !open)}
        aria-expanded={showHistory}
        className="inline-flex w-fit items-center gap-1 text-xs font-medium text-accent hover:underline"
      >
        {showHistory ? 'Hide history' : `History (${correction.history.length})`}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
      </button>

      {showHistory && (
        <ol className="flex flex-col gap-2 border-l border-card-border pl-3">
          {correction.history.map((entry, index) => (
            <li key={`${entry.action}-${entry.at}-${index}`} className="text-xs">
              <p className="font-medium text-card-heading">
                {HISTORY_LABELS[entry.action]}{' '}
                <span className="font-normal text-card-text-muted">
                  · {entry.byName} · {new Date(entry.at).toLocaleString()}
                </span>
              </p>
              {entry.note && <p className="mt-0.5 text-card-text-muted whitespace-pre-line break-words">{entry.note}</p>}
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}
