import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { PageLoader } from '@/components/loaders/PageLoader'
import { FactCheckSources } from '../components/FactCheckSources'
import { VerdictBadge } from '../components/VerdictBadge'
import { usePublicFactCheck } from '../hooks/usePublicFactChecks'
import { VERDICT_MEANINGS } from '../utils/verdicts'

function Block({ title, children }: { title: string; children: string | null }) {
  if (!children) return null
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="text-sm font-semibold text-heading">{title}</h2>
      <p className="text-[15px] text-text leading-relaxed whitespace-pre-line break-words">{children}</p>
    </section>
  )
}

export function FactCheckPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: factCheck, isLoading, error } = usePublicFactCheck(id)

  if (isLoading) return <PageLoader label="Loading fact check..." />

  if (error || !factCheck) {
    return (
      <div className="py-16 flex flex-col items-center text-center gap-3">
        <h1 className="text-2xl font-semibold text-heading">Fact check not found</h1>
        <p className="text-sm text-text-muted">It may have been withdrawn while it is looked at again, or it never existed.</p>
        <Link to="/fact-checks" className="text-accent font-medium hover:underline text-sm">
          All fact checks
        </Link>
      </div>
    )
  }

  const hasReasoning = Boolean(factCheck.conclusion || factCheck.reasoning)

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6 max-w-3xl mx-auto">
      <Link to="/fact-checks" className="self-start flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        All fact checks
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wide font-medium text-accent">{factCheck.article.category}</span>
          <VerdictBadge verdict={factCheck.verdict} />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-heading leading-snug break-words">&ldquo;{factCheck.claim}&rdquo;</h1>
        <p className="text-sm text-text-muted">{VERDICT_MEANINGS[factCheck.verdict]}</p>
        <p className="text-sm text-text-muted">
          {factCheck.checkedBy ? `Checked by ${factCheck.checkedBy}` : 'Checked by our team'}
          {factCheck.checkedAt && (
            <>
              {' · '}
              <time dateTime={factCheck.checkedAt}>{dayjs(factCheck.checkedAt).format('MMM D, YYYY')}</time>
            </>
          )}
        </p>
        {factCheck.revisedAt && (
          <p className="text-xs text-text-muted rounded-xl border border-pending/30 bg-pending/10 px-3 py-2">
            This conclusion was revised on {dayjs(factCheck.revisedAt).format('MMM D, YYYY')}.
          </p>
        )}
      </header>

      {hasReasoning ? (
        <div className="flex flex-col gap-5">
          <Block title="Conclusion">{factCheck.conclusion}</Block>
          <Block title="How we reached it">{factCheck.reasoning}</Block>
          <Block title="Limits of this check">{factCheck.limitations}</Block>
          <Block title="What is still uncertain">{factCheck.uncertainty}</Block>
        </div>
      ) : (
        <p className="text-sm text-text-muted">The reviewer did not write up their reasoning for this one.</p>
      )}

      <FactCheckSources factCheck={factCheck} />

      <section aria-labelledby="fc-article-heading" className="flex flex-col gap-2 rounded-2xl border border-card-border bg-card p-5">
        <h2 id="fc-article-heading" className="text-sm font-semibold text-card-heading uppercase tracking-wide">
          Where this appeared
        </h2>
        <Link to={`/article/${factCheck.article.slug}`} className="text-sm font-medium text-accent hover:underline break-words">
          {factCheck.article.title}
        </Link>
        {factCheck.corrections.length > 0 && (
          <div className="mt-2 flex flex-col gap-2 border-t border-card-border pt-3">
            <h3 className="text-xs font-semibold text-card-text-muted">Corrections on this story</h3>
            <ol className="flex flex-col gap-2">
              {factCheck.corrections.map((correction) => (
                <li key={correction.number} className="text-sm text-card-text">
                  <span className="font-medium text-card-heading">Correction {correction.number}</span>
                  <span className="text-card-text-muted"> · {dayjs(correction.publishedAt).format('MMM D, YYYY')}</span>
                  <p className="mt-0.5 whitespace-pre-line break-words">{correction.text}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  )
}
