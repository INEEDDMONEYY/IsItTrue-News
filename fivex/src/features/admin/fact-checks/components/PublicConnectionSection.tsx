import { Link } from 'react-router-dom'
import { ExternalLink, Link2 } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import type { ActionDialog, FactCheckRecord } from '../types/factCheck.types'
import { Field, NotRecorded, RecordSection } from './RecordSection'

const ARTICLE_MARK: Record<string, string> = {
  approved: 'Marked fact-checked by an editor',
  pending: 'Fact-check under review',
  rejected: 'Flagged during fact-check verification',
  none: 'Not marked fact-checked',
}

// 5. Where this claim reaches readers and what else it touches: the article (and its live page when published),
// any corrections on that article, and an investigation it has been linked to.
export function PublicConnectionSection({ record, onOpen }: { record: FactCheckRecord; onOpen: (dialog: ActionDialog) => void }) {
  const { article, corrections, investigation } = record.connections

  return (
    <RecordSection id="public" number={5} title="Public connection">
      <dl>
        <Field label="Article">
          {article ? (
            <span className="flex flex-col gap-1">
              <Link to={`/admin/articles/${article.id}`} className="text-accent hover:underline">
                {article.title}
              </Link>
              <span className="text-xs text-card-text-muted">
                {article.status.replace('_', ' ')} · {article.category} · {ARTICLE_MARK[article.factCheckStatus] ?? article.factCheckStatus}
              </span>
              {article.publicUrl ? (
                <Link to={article.publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1 text-xs text-accent hover:underline">
                  View the public page
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </Link>
              ) : (
                <span className="text-xs text-card-text-dim">Not published, so readers can&apos;t see it yet.</span>
              )}
            </span>
          ) : (
            <span className="italic text-card-text-dim">The article has been removed</span>
          )}
        </Field>

        <Field label="Corrections on this article">
          {corrections.length === 0 ? (
            <span className="italic text-card-text-dim">None</span>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {corrections.map((correction) => (
                <li key={correction.id} className="text-sm">
                  <span className="font-medium text-card-heading">
                    {correction.number ? `Correction ${correction.number}` : 'Correction'}
                  </span>
                  <span className="text-card-text-muted"> · {correction.status} · {dayjs(correction.createdAt).format('MMM D, YYYY')}</span>
                  <p className="text-xs text-card-text-muted">{correction.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </Field>

        <Field label="Investigation">
          <span className="flex flex-wrap items-center gap-3">
            {investigation ? (
              <span>
                {investigation.title} <span className="text-xs text-card-text-muted">({investigation.status})</span>
              </span>
            ) : (
              <NotRecorded />
            )}
            <button
              type="button"
              onClick={() => onOpen({ kind: 'investigation' })}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-card-text-muted hover:text-accent transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
              {investigation ? 'Change link' : 'Link an investigation'}
            </button>
          </span>
        </Field>
      </dl>
    </RecordSection>
  )
}
