import { ExternalLink } from 'lucide-react'
import type { PublicFactCheck } from '../types/publicFactCheck.types'
import { RELIABILITY_LABELS, STANCE_LABELS, isSafeWebUrl } from '../utils/verdicts'

const STANCES = ['supporting', 'contradicting', 'context'] as const

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  // The server only sends web addresses, and this checks again before making one clickable.
  if (!isSafeWebUrl(href)) return <span className="break-all">{children}</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline break-all">
      {children}
      <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
    </a>
  )
}

// The evidence behind a conclusion: what supports the claim, what contradicts it, and the source links, each
// with a note on how reliable it is. Evidence an admin restricted never gets here.
export function FactCheckSources({ factCheck }: { factCheck: PublicFactCheck }) {
  const { evidence, sources } = factCheck
  const nothing = evidence.length === 0 && sources.length === 0

  return (
    <section aria-labelledby="fc-evidence-heading" className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-5">
      <h2 id="fc-evidence-heading" className="text-sm font-semibold text-card-heading uppercase tracking-wide">
        Evidence &amp; sources
      </h2>

      {nothing && <p className="text-sm text-card-text-muted">No public sources are attached to this fact-check.</p>}

      {STANCES.map((stance) => {
        const items = evidence.filter((item) => item.stance === stance)
        if (items.length === 0) return null
        return (
          <div key={stance}>
            <h3 className="mb-2 text-xs font-semibold text-card-text-muted">{STANCE_LABELS[stance]}</h3>
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.id} className="rounded-xl border border-card-border bg-card-2 p-3 text-sm">
                  <p className="font-medium text-card-heading break-words">{item.title}</p>
                  {item.url && (
                    <p className="mt-1">
                      <SourceLink href={item.url}>{item.url}</SourceLink>
                    </p>
                  )}
                  {item.citation && <p className="mt-1 text-card-text whitespace-pre-line break-words">{item.citation}</p>}
                  <p className="mt-2 text-xs text-card-text-muted">
                    {RELIABILITY_LABELS[item.reliability]}
                    {item.reliabilityNote ? `: ${item.reliabilityNote}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {sources.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold text-card-text-muted">Further sources</h3>
          <ul className="flex flex-col gap-1.5 text-sm">
            {sources.map((source) => (
              <li key={source}>
                <SourceLink href={source}>{source}</SourceLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
