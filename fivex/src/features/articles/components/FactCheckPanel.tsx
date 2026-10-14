import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import dayjs from '@/lib/dayjs'
import { VerdictBadge } from '@/features/fact-checks/components/VerdictBadge'
import type { ArticleFactCheck } from '@/features/fact-checks/types/publicFactCheck.types'
import { VERDICT_MEANINGS, describeCounts } from '@/features/fact-checks/utils/verdicts'

interface FactCheckPanelProps {
  // Undefined while it loads or if it could not be loaded.
  factCheck: ArticleFactCheck | undefined
  isLoading?: boolean
  isError?: boolean
  // Turns the links to full fact-checks into plain text, for the author's preview where nothing exists yet.
  linked?: boolean
}

function headline(factCheck: ArticleFactCheck): string {
  if (factCheck.flagged) {
    return 'This story was flagged during fact-check verification. Its conclusions are on hold while it is looked at again.'
  }
  if (factCheck.claims.length === 0) {
    return factCheck.openClaims > 0
      ? 'Our team is checking claims in this story. The verdict will appear here once the review is complete.'
      : 'No claims from this story have been fact-checked yet.'
  }
  return describeCounts(factCheck.counts)
}

// The fact-check section of a story, from the real claim records. The story's verdict comes from what its claims
// concluded, not from a stamp, and every claim links to its full reasoning and evidence.
export const FactCheckPanel = forwardRef<HTMLDivElement, FactCheckPanelProps>(function FactCheckPanel(
  { factCheck, isLoading = false, isError = false, linked = true },
  ref,
) {
  return (
    <div ref={ref} className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-5 scroll-mt-24">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-card-heading uppercase tracking-wide">Fact-Check Status</h3>
        {factCheck && <VerdictBadge verdict={factCheck.verdict} />}
      </div>

      {isLoading && (
        <p role="status" className="text-sm text-card-text-muted">
          Loading the fact-check…
        </p>
      )}

      {isError && !factCheck && (
        <p role="alert" className="text-sm text-card-text-muted">
          We couldn&apos;t load this story&apos;s fact-check right now. Please try again in a moment.
        </p>
      )}

      {factCheck && (
        <>
          <p className="text-sm text-card-text leading-relaxed">{headline(factCheck)}</p>

          {factCheck.claims.length > 0 && factCheck.openClaims > 0 && (
            <p className="text-xs text-card-text-muted">
              {factCheck.openClaims === 1 ? '1 more claim is' : `${factCheck.openClaims} more claims are`} still being checked.
            </p>
          )}

          {factCheck.claims.length > 0 && (
            <ul className="flex flex-col gap-3 pt-3 border-t border-card-border">
              {factCheck.claims.map((claim) => (
                <li key={claim.id} className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium text-card-heading break-words min-w-0">&ldquo;{claim.claim}&rdquo;</p>
                    <VerdictBadge verdict={claim.verdict} />
                  </div>
                  <p className="text-xs text-card-text-muted">{VERDICT_MEANINGS[claim.verdict]}</p>
                  {claim.summary && <p className="text-sm text-card-text break-words">{claim.summary}</p>}
                  <p className="text-xs text-card-text-dim">
                    {claim.checkedBy ? `Checked by ${claim.checkedBy}` : 'Checked by our team'}
                    {claim.checkedAt && ` · ${dayjs(claim.checkedAt).format('MMM D, YYYY')}`}
                    {' · '}
                    {linked ? (
                      <Link to={`/fact-checks/${claim.id}`} className="text-accent hover:underline">
                        Read the full fact check
                      </Link>
                    ) : (
                      'Full fact check'
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {factCheck.editorSignOff && (
            <p className="text-xs text-card-text-dim pt-2 border-t border-card-border">
              An editor{factCheck.editorSignOff.by ? `, ${factCheck.editorSignOff.by},` : ''} confirmed on{' '}
              {dayjs(factCheck.editorSignOff.at).format('MMM D, YYYY')} that every claim in this story has been looked at.
            </p>
          )}
        </>
      )}
    </div>
  )
})
