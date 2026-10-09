import { useState } from 'react'
import { BadgeCheck, CircleHelp, ClipboardList, ShieldCheck, UserX } from 'lucide-react'
import { StatCard } from '@/components/cards'
import { useAuth } from '@/app/providers/AuthProvider'
import { PageLoader } from '@/components/loaders/PageLoader'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ClaimCard } from '../components/ClaimCard'
import { useFactCheckOversight } from '../hooks/useFactCheckOversight'
import {
  CLAIM_STATUSES,
  claimStatusLabels,
  isOpenClaim,
  type ArticleFactCheckState,
  type ClaimStatus,
  type FactCheckArticle,
} from '../types/claim.types'

type Tab = 'claims' | 'articles'

const fieldClass = 'rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-heading'

const articleStateLabels: Record<ArticleFactCheckState, string> = {
  approved: 'Fact-checked',
  pending: 'Awaiting admin review',
  rejected: 'Flagged by admin',
  none: 'Not fact-checked',
}

const articleStateTone: Record<ArticleFactCheckState, string> = {
  approved: 'bg-verified/10 text-verified border-verified/30',
  pending: 'bg-pending/10 text-pending border-pending/30',
  rejected: 'bg-disputed/10 text-disputed border-disputed/30',
  none: 'bg-card text-text-muted border-border',
}

function ArticleRow({
  article,
  onToggle,
  onViewClaims,
  onAddClaim,
  isSaving,
}: {
  article: FactCheckArticle
  onToggle: (factChecked: boolean) => Promise<unknown>
  onViewClaims: () => void
  onAddClaim: () => void
  isSaving: boolean
}) {
  const [error, setError] = useState<string | null>(null)
  const isVerified = article.factCheckStatus === 'approved'
  const blockedReason =
    article.claimTotal === 0
      ? 'Add at least one claim first.'
      : article.openClaims > 0
        ? `${article.openClaims} ${article.openClaims === 1 ? 'claim is' : 'claims are'} still open.`
        : null

  const toggle = async () => {
    setError(null)
    try {
      await onToggle(!isVerified)
    } catch (err) {
      setError(getErrorMessage(err, 'Couldn’t update this article.'))
    }
  }

  const tallies = CLAIM_STATUSES.filter((status) => article.claimCounts[status])

  return (
    <article className="rounded-xl border border-card-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-semibold text-card-heading">{article.title}</h3>
          <p className="mt-1 text-xs text-card-text-muted">
            {article.author?.name ?? 'Unknown author'} ·{' '}
            {article.status === 'published' ? 'Published' : 'Awaiting editorial review'}
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${articleStateTone[article.factCheckStatus]}`}
        >
          {articleStateLabels[article.factCheckStatus]}
        </span>
      </div>

      <p className="mt-3 text-xs text-card-text-muted">
        {article.claimTotal === 0
          ? 'No claims tracked yet.'
          : tallies.map((status) => `${article.claimCounts[status]} ${claimStatusLabels[status]}`).join(' · ')}
      </p>
      {article.factCheckStatus === 'rejected' && article.factCheckRejectionReason && (
        <p className="mt-2 text-xs text-disputed">Admin note: {article.factCheckRejectionReason}</p>
      )}
      {isVerified && article.factCheckReviewedBy?.name && (
        <p className="mt-2 text-xs text-card-text-muted">
          Verified by {article.factCheckReviewedBy.name}
          {article.factCheckReviewedAt ? ` on ${new Date(article.factCheckReviewedAt).toLocaleDateString()}` : ''}
        </p>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-disputed">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onViewClaims}
          className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-heading"
        >
          View claims
        </button>
        <button
          type="button"
          onClick={onAddClaim}
          className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-heading"
        >
          Add claim
        </button>
        {article.factCheckStatus === 'rejected' ? (
          <span className="text-xs text-text-muted">Resolve this in Fact Check Verification.</span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void toggle()}
              disabled={isSaving || (!isVerified && blockedReason !== null)}
              className="rounded-lg bg-brand-gradient px-3 py-2 text-sm font-medium text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isVerified ? 'Remove fact-checked mark' : 'Mark as fact-checked'}
            </button>
            {!isVerified && blockedReason && <span className="text-xs text-text-muted">{blockedReason}</span>}
          </>
        )}
      </div>
    </article>
  )
}

function AddClaimForm({
  articles,
  articleId,
  onArticleChange,
  onCreate,
  isSaving,
}: {
  articles: FactCheckArticle[]
  articleId: string
  onArticleChange: (id: string) => void
  onCreate: (input: { articleId: string; text: string }) => Promise<unknown>
  isSaving: boolean
}) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!articleId || !text.trim()) return
    setError(null)
    try {
      await onCreate({ articleId, text: text.trim() })
      setText('')
    } catch (err) {
      setError(getErrorMessage(err, 'Couldn’t add this claim.'))
    }
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-xl border border-card-border bg-card p-4">
      <h2 className="mb-1 text-sm font-semibold text-card-heading">Track a new claim</h2>
      <p className="mb-3 text-xs text-card-text-muted">You will be recorded as the editor responsible for it.</p>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <label className="block text-xs font-medium text-text-muted">
          Article
          <select
            className={`${fieldClass} mt-1 block w-full`}
            value={articleId}
            onChange={(e) => onArticleChange(e.target.value)}
            required
          >
            <option value="">Select an article…</option>
            {articles.map((article) => (
              <option key={article.id} value={article.id}>{article.title}</option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={isSaving || !articleId || !text.trim()}
          className="rounded-lg bg-brand-gradient px-3 py-2 text-sm font-medium text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add claim
        </button>
      </div>
      <label className="mt-3 block text-xs font-medium text-text-muted">
        Claim, as stated in the article
        <textarea
          className={`${fieldClass} mt-1 block w-full`}
          rows={2}
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-disputed">{error}</p>}
    </form>
  )
}

export function FactCheckOversightPage() {
  const oversight = useFactCheckOversight()
  const { claims, articles, isSaving } = oversight
  const { user } = useAuth()

  const [tab, setTab] = useState<Tab>('claims')
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [articleFilter, setArticleFilter] = useState('')
  const [newClaimArticle, setNewClaimArticle] = useState('')

  if (oversight.isLoading) return <PageLoader label="Loading fact-check oversight..." />
  if (oversight.isError) {
    return (
      <p role="alert" className="text-sm text-disputed">
        Couldn&apos;t load fact-check oversight. Please refresh and try again.
      </p>
    )
  }

  const openClaims = claims.filter((claim) => isOpenClaim(claim.status))
  const filteredClaims = claims.filter(
    (claim) =>
      (statusFilter === 'all' || claim.status === statusFilter) &&
      (assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' ? !claim.assignee : claim.assignee?.id === user?.id)) &&
      (!articleFilter || claim.article?.id === articleFilter),
  )
  const filteredArticle = articles.find((article) => article.id === articleFilter)

  const goToClaims = (articleId: string, addClaim: boolean) => {
    setArticleFilter(addClaim ? '' : articleId)
    if (addClaim) setNewClaimArticle(articleId)
    setTab('claims')
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-heading">Fact Check Oversight</h1>
      <p className="mb-6 max-w-3xl text-sm text-text-muted">
        See which claims are being verified, who is responsible for each, and where the evidence stands.
        The responsible editor is always the account that added or took the claim. Once every claim in an
        article has a verdict, mark the article as fact-checked.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open claims" value={openClaims.length} icon={ClipboardList} />
        <StatCard label="Open & unassigned" value={openClaims.filter((claim) => !claim.assignee).length} icon={UserX} />
        <StatCard label="Verified claims" value={claims.filter((claim) => claim.status === 'verified').length} icon={BadgeCheck} />
        <StatCard
          label="Fact-checked articles"
          value={articles.filter((article) => article.factCheckStatus === 'approved').length}
          icon={ShieldCheck}
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Fact-check views">
        {([
          { id: 'claims', label: `Claims (${claims.length})` },
          { id: 'articles', label: `Articles (${articles.length})` },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === id ? 'bg-brand-gradient text-on-brand' : 'text-text-muted hover:bg-card hover:text-heading'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'claims' && (
        <section aria-label="Claims">
          <AddClaimForm
            articles={articles}
            articleId={newClaimArticle}
            onArticleChange={setNewClaimArticle}
            onCreate={oversight.createClaim}
            isSaving={isSaving}
          />

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <select
              aria-label="Filter by status"
              className={fieldClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'all')}
            >
              <option value="all">All statuses</option>
              {CLAIM_STATUSES.map((status) => (
                <option key={status} value={status}>{claimStatusLabels[status]}</option>
              ))}
            </select>
            <select
              aria-label="Filter by responsible editor"
              className={fieldClass}
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="all">Anyone responsible</option>
              <option value="mine">My claims</option>
              <option value="unassigned">Unassigned</option>
            </select>
            {articleFilter && (
              <button
                type="button"
                onClick={() => setArticleFilter('')}
                className="rounded-full border border-accent-border px-3 py-1.5 text-xs text-accent"
              >
                {filteredArticle?.title ?? 'One article'} ✕
              </button>
            )}
          </div>

          {filteredClaims.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-card-border bg-card p-8 text-center text-sm text-card-text-muted">
              <CircleHelp aria-hidden="true" className="size-6" />
              {claims.length === 0 ? 'No claims are being tracked yet.' : 'No claims match these filters.'}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredClaims.map((claim) => (
                <ClaimCard
                  key={`${claim.id}:${claim.updatedAt}`}
                  claim={claim}
                  currentUserId={user?.id}
                  isSaving={isSaving}
                  onSave={(changes) => oversight.updateClaim(claim.id, changes)}
                  onDelete={() => oversight.deleteClaim(claim.id)}
                  onTake={() => oversight.takeResponsibility(claim.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'articles' && (
        <section aria-label="Articles">
          {articles.length === 0 ? (
            <div className="rounded-xl border border-card-border bg-card p-8 text-center text-sm text-card-text-muted">
              No submitted or published articles to fact-check.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {articles.map((article) => (
                <ArticleRow
                  key={`${article.id}:${article.updatedAt}:${article.claimTotal}:${article.openClaims}`}
                  article={article}
                  isSaving={isSaving}
                  onToggle={(factChecked) => oversight.setFactChecked(article.id, factChecked)}
                  onViewClaims={() => goToClaims(article.id, false)}
                  onAddClaim={() => goToClaims(article.id, true)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
