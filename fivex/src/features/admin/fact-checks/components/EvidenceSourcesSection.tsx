import { ExternalLink, Flag, Lock, LockOpen } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import type { ActionDialog, EvidenceItem, FactCheckRecord } from '../types/factCheck.types'
import { EVIDENCE_STATUS_LABELS, RELIABILITY_LABELS, STANCE_LABELS, STANCE_ORDER, isSafeWebUrl } from '../utils/factCheckLabels'
import { EvidenceBadge } from './FactCheckStatusBadge'
import { Field, NotRecorded, RecordSection } from './RecordSection'

function SafeLink({ href, children }: { href: string; children: React.ReactNode }) {
  // Only web addresses become links; anything else is shown as text rather than made clickable.
  if (!isSafeWebUrl(href)) return <span className="break-all">{children}</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline break-all">
      {children}
      <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
    </a>
  )
}

function Item({ item, onOpen }: { item: EvidenceItem; onOpen: (dialog: ActionDialog) => void }) {
  return (
    <li className="rounded-xl border border-card-border bg-card-2 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium text-card-heading break-words">{item.title}</p>
        <button
          type="button"
          onClick={() => onOpen({ kind: 'restrict', item })}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-card-text-muted hover:text-accent transition-colors"
        >
          {item.restricted ? <LockOpen className="w-3.5 h-3.5" aria-hidden="true" /> : <Lock className="w-3.5 h-3.5" aria-hidden="true" />}
          {item.restricted ? 'Lift restriction' : 'Restrict access'}
        </button>
      </div>
      {item.restricted && (
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-pending">
          <Lock className="w-3 h-3" aria-hidden="true" />
          Restricted: hidden from editors
        </p>
      )}
      {item.url && (
        <p className="mt-1 text-sm">
          <SafeLink href={item.url}>{item.url}</SafeLink>
        </p>
      )}
      {item.citation && <p className="mt-1 text-sm text-card-text whitespace-pre-line break-words">{item.citation}</p>}
      <p className="mt-2 text-xs text-card-text-muted">
        {RELIABILITY_LABELS[item.reliability]}
        {item.reliabilityNote ? `: ${item.reliabilityNote}` : ''}
      </p>
      <p className="mt-1 text-xs text-card-text-dim">
        Added by {item.addedBy?.name ?? 'a former user'}, {dayjs(item.addedAt).format('MMM D, YYYY')}
      </p>
    </li>
  )
}

// 2. What the conclusion rests on: the reviewer's evidence status, structured evidence (supporting and
// contradicting, with a note on how reliable each source is) and the plain source links.
export function EvidenceSourcesSection({ record, onOpen }: { record: FactCheckRecord; onOpen: (dialog: ActionDialog) => void }) {
  const { evidence } = record
  const nothing = evidence.items.length === 0 && evidence.sources.length === 0
  const claimsSufficient = nothing && evidence.status === 'sufficient'

  return (
    <RecordSection id="evidence" number={2} title="Evidence & sources">
      <div className="flex flex-wrap items-center gap-2">
        <EvidenceBadge state={evidence.state} />
        <span className="text-xs text-card-text-muted">Reviewer&apos;s assessment of the evidence: {EVIDENCE_STATUS_LABELS[evidence.status]}</span>
      </div>

      {claimsSufficient && (
        <p className="mt-3 text-sm text-pending">The reviewer marked the evidence Sufficient, but nothing is attached to back that up.</p>
      )}

      {evidence.flag && (
        <div className="mt-3 rounded-xl border border-pending/30 bg-pending/10 p-3" role="note">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-card-heading">
            <Flag className="w-4 h-4 text-pending" aria-hidden="true" />
            Flagged as incomplete
          </p>
          <p className="mt-1 text-sm text-card-text whitespace-pre-line break-words">{evidence.flag.reason}</p>
          <p className="mt-1 text-xs text-card-text-dim">
            {evidence.flag.by?.name ?? 'An admin'}, {dayjs(evidence.flag.at).format('MMM D, YYYY')}
          </p>
        </div>
      )}

      <dl className="mt-3">
        <Field label="Reviewer's summary">{evidence.summary ?? <NotRecorded />}</Field>
      </dl>

      {STANCE_ORDER.map((stance) => {
        const items = evidence.items.filter((item) => item.stance === stance)
        if (items.length === 0) return null
        return (
          <div key={stance} className="mt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-card-text-muted">{STANCE_LABELS[stance]}</h3>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <Item key={item.id} item={item} onOpen={onOpen} />
              ))}
            </ul>
          </div>
        )
      })}

      {evidence.sources.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-card-text-muted">Linked sources</h3>
          <ul className="flex flex-col gap-1.5">
            {evidence.sources.map((source) => (
              <li key={source} className="text-sm">
                <SafeLink href={source}>{source}</SafeLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      {nothing && <p className="mt-4 text-sm text-card-text-muted">No evidence or sources are attached to this record.</p>}
    </RecordSection>
  )
}
