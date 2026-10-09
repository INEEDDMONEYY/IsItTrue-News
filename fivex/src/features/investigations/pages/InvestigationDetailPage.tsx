import { Link, useParams } from 'react-router-dom'
import { Bookmark, Users } from 'lucide-react'
import DOMPurify from 'dompurify'
import dayjs from '@/lib/dayjs'
import { useAuth } from '@/app/providers/AuthProvider'
import { PageLoader } from '@/components/loaders/PageLoader'
import { EvidenceViewer } from '@/features/evidence/components/EvidenceViewer'
import { useInvestigation } from '../hooks/useInvestigation'
import { InvestigationTimeline } from '../components/InvestigationTimeline'
import { InvestigationCommentSection } from '../components/InvestigationCommentSection'
import type { PublicInvestigationDetail } from '../types/investigation.types'

export function InvestigationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const { investigation, workspace, isLoading, addComment, isPostingComment, toggleBookmark, toggleFollow } =
    useInvestigation(id)

  if (isLoading) {
    return <PageLoader label="Loading investigation..." />
  }

  if (!investigation) {
    return (
      <div className="py-16 flex flex-col items-center text-center gap-3">
        <h1 className="text-2xl font-semibold text-heading">Investigation not found</h1>
        <p className="text-sm text-text-muted">This investigation may not be published yet.</p>
        <Link to="/investigations" className="text-accent font-medium hover:underline text-sm">
          Back to Investigations
        </Link>
      </div>
    )
  }

  // Authors/collaborators/editors/admins get the full workspace doc from
  // the backend when viewing their own investigation here — send them to
  // the real workspace instead of trying to render raw internal fields on
  // this public-facing page.
  if (workspace) {
    return (
      <div className="py-16 flex flex-col items-center text-center gap-3">
        <h1 className="text-2xl font-semibold text-heading">This is one of your investigations</h1>
        <p className="text-sm text-text-muted">Manage its content, evidence, and status from your workspace.</p>
        <Link
          to={`/author/investigations/${id}`}
          className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-on-brand transition"
        >
          Open in Investigation Workspace
        </Link>
      </div>
    )
  }

  const publicInvestigation = investigation as PublicInvestigationDetail
  const authorName =
    publicInvestigation.author?.authorProfile?.professionalName || publicInvestigation.author?.name || 'Staff Investigator'
  const sanitizedBodyHtml = publicInvestigation.bodyHtml
    ? DOMPurify.sanitize(publicInvestigation.bodyHtml).trim() || null
    : null

  return (
    <div className="py-6 md:py-10 flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-3">
        {publicInvestigation.category && (
          <span className="text-[11px] uppercase tracking-wide font-medium text-accent">
            {publicInvestigation.category}
          </span>
        )}

        <h1 className="text-2xl md:text-3xl font-semibold text-heading leading-snug">
          {publicInvestigation.title}
        </h1>

        {publicInvestigation.subheadline && (
          <p className="text-base text-text-muted">{publicInvestigation.subheadline}</p>
        )}

        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="font-medium text-heading">{authorName}</span>
          {publicInvestigation.publishedAt && (
            <>
              <span>·</span>
              <span>{dayjs(publicInvestigation.publishedAt).format('MMM D, YYYY')}</span>
            </>
          )}
        </div>
      </div>

      {publicInvestigation.coverImage && (
        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-card-2">
          <img
            src={publicInvestigation.coverImage}
            alt={publicInvestigation.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleFollow}
          disabled={!isAuthenticated}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
            publicInvestigation.following
              ? 'border-accent-border bg-accent-bg text-accent'
              : 'border-card-border text-card-text hover:border-accent-border'
          }`}
        >
          <Users className="h-4 w-4" />
          {publicInvestigation.following ? 'Following' : 'Follow'} · {publicInvestigation.followersCount}
        </button>

        <button
          type="button"
          onClick={toggleBookmark}
          disabled={!isAuthenticated}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
            publicInvestigation.bookmarked
              ? 'border-accent-border bg-accent-bg text-accent'
              : 'border-card-border text-card-text hover:border-accent-border'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          {publicInvestigation.bookmarked ? 'Bookmarked' : 'Bookmark'} · {publicInvestigation.bookmarksCount}
        </button>
      </div>

      <p className="text-[15px] leading-relaxed text-text">{publicInvestigation.summary}</p>

      {sanitizedBodyHtml && (
        <div
          className="article-body text-[15px] text-text leading-relaxed space-y-4 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-heading [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-heading [&_blockquote]:border-l-2 [&_blockquote]:border-accent-border [&_blockquote]:pl-3 [&_blockquote]:text-text-muted [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: sanitizedBodyHtml }}
        />
      )}

      <InvestigationTimeline entries={publicInvestigation.timeline} />

      <EvidenceViewer investigationId={publicInvestigation.id} />

      <InvestigationCommentSection
        comments={publicInvestigation.comments}
        onSubmit={addComment}
        isPosting={isPostingComment}
      />
    </div>
  )
}
