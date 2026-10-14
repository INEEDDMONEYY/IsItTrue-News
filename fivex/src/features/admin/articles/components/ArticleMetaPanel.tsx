import { Link } from 'react-router-dom'
import { Check, Circle } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import type { AdminArticleDetail } from '../types/adminArticle.types'
import { FactCheckBadge } from './ArticleStatusBadge'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-card-border last:border-0">
      <dt className="text-xs text-card-text-dim">{label}</dt>
      <dd className="text-sm text-card-text text-right break-words min-w-0">{children}</dd>
    </div>
  )
}

const date = (value: string | null) => (value ? dayjs(value).format('MMM D, YYYY h:mm A') : '—')

export function ArticleMetaPanel({ article }: { article: AdminArticleDetail }) {
  const openRequirements = article.reviewRequirements.filter((requirement) => !requirement.done).length

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="details-heading" className="rounded-2xl border border-card-border bg-card p-5">
        <h2 id="details-heading" className="text-sm font-semibold text-card-heading mb-2">
          Details
        </h2>
        <dl>
          <Row label="Author">
            {article.author ? (
              <Link to={`/authors/${article.author.id}`} className="text-accent hover:underline">
                {article.author.name}
              </Link>
            ) : (
              <span className="italic text-card-text-muted">Deleted user</span>
            )}
          </Row>
          <Row label="Category">{article.category}</Row>
          <Row label="Tags">{article.tags.length ? article.tags.join(', ') : '—'}</Row>
          <Row label="Created">{date(article.createdAt)}</Row>
          <Row label="Last updated">{date(article.updatedAt)}</Row>
          <Row label="Submitted">{date(article.submittedAt)}</Row>
          <Row label="Published">{date(article.publishedAt)}</Row>
          <Row label="Editorial stage">{article.editorialStage ?? '—'}</Row>
          <Row label="Deadline">{article.editorialDeadline ? dayjs(article.editorialDeadline).format('MMM D, YYYY') : '—'}</Row>
          <Row label="Reviewed by">
            {article.reviewedBy ? `${article.reviewedBy.name}, ${date(article.reviewedAt)}` : '—'}
          </Row>
        </dl>
      </section>

      <section aria-labelledby="fact-heading" className="rounded-2xl border border-card-border bg-card p-5">
        <h2 id="fact-heading" className="text-sm font-semibold text-card-heading mb-2">
          Fact-check
        </h2>
        <dl>
          <Row label="Status">
            <FactCheckBadge status={article.factCheckStatus} />
          </Row>
          <Row label="Checked by">
            {article.factCheckReviewedBy ? `${article.factCheckReviewedBy.name}, ${date(article.factCheckReviewedAt)}` : '—'}
          </Row>
          {article.factCheckRejectionReason && <Row label="Reason">{article.factCheckRejectionReason}</Row>}
          <Row label="Corrections">{article.corrections.length}</Row>
        </dl>
      </section>

      <section aria-labelledby="engagement-heading" className="rounded-2xl border border-card-border bg-card p-5">
        <h2 id="engagement-heading" className="text-sm font-semibold text-card-heading mb-2">
          Engagement
        </h2>
        <dl>
          <Row label="Views">{article.views.toLocaleString()}</Row>
          <Row label="Likes / dislikes">
            {article.engagement.likes.toLocaleString()} / {article.engagement.dislikes.toLocaleString()}
          </Row>
          <Row label="Shares">{article.engagement.shares.toLocaleString()}</Row>
          <Row label="Bookmarks">{article.engagement.bookmarks.toLocaleString()}</Row>
        </dl>
      </section>

      {(article.reviewNote || article.reviewRequirements.length > 0) && (
        <section aria-labelledby="feedback-heading" className="rounded-2xl border border-pending/30 bg-pending/10 p-5">
          <h2 id="feedback-heading" className="text-sm font-semibold text-card-heading mb-2">
            Editorial feedback
          </h2>
          {article.reviewNote && <p className="text-sm text-card-text whitespace-pre-line break-words">{article.reviewNote}</p>}
          {article.reviewRequirements.length > 0 && (
            <>
              <p className="mt-3 text-xs text-card-text-muted">
                {openRequirements === 0 ? 'Every requirement is done.' : `${openRequirements} of ${article.reviewRequirements.length} still open.`}
              </p>
              <ul className="mt-1 flex flex-col gap-1.5">
                {article.reviewRequirements.map((requirement) => (
                  <li key={requirement.id} className="flex items-start gap-2 text-sm text-card-text">
                    {requirement.done ? (
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-verified" aria-label="Done" />
                    ) : (
                      <Circle className="w-4 h-4 mt-0.5 shrink-0 text-card-text-dim" aria-label="Open" />
                    )}
                    <span>{requirement.text}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  )
}
