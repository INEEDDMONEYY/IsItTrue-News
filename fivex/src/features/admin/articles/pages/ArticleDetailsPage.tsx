import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { LoaderState } from '@/components/loaders/LoaderState'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { ArticleActions } from '../components/ArticleActions'
import { ArticleAuditHistory } from '../components/ArticleAuditHistory'
import { ArticleMetaPanel } from '../components/ArticleMetaPanel'
import { ArticlePreview } from '../components/ArticlePreview'
import { ArticleStatusBadge, FactCheckBadge } from '../components/ArticleStatusBadge'
import { useAdminArticle, useAdminArticleAudit } from '../hooks/useAdminArticles'

function BackLink() {
  return (
    <Link to="/admin/articles" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors">
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      All articles
    </Link>
  )
}

export function ArticleDetailsPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: article, isLoading, error } = useAdminArticle(id)
  const audit = useAdminArticleAudit(id)

  if (isLoading) return <PageLoader label="Loading article..." />

  if (error || !article) {
    return (
      <div className="flex flex-col gap-3">
        <BackLink />
        <LoaderState
          alert
          className="py-8"
          title="Article not found"
          message={getErrorMessage(error, 'This article may have been deleted.')}
        />
        {/* A deleted article's history is kept, so it stays reachable here. */}
        {audit.data && audit.data.entries.length > 0 && <ArticleAuditHistory trail={audit.data} isLoading={false} error={null} />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <BackLink />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <ArticleStatusBadge status={article.status} />
        <FactCheckBadge status={article.factCheckStatus} />
        {article.status === 'published' && (
          <Link
            to={`/article/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
          >
            View live
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </Link>
        )}
        {/* The headline itself is the page's h1, shown once in the reader view below. */}
        <span className="text-xs text-text-dim">Article id {article.id}</span>
      </div>

      {/* On a phone the status controls come first; from xl they sit in the right-hand column beside the content. */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:grid-rows-[auto_1fr] xl:items-start">
        <div className="min-w-0 xl:col-start-2 xl:row-start-1">
          <ArticleActions article={article} />
        </div>

        <div className="flex flex-col gap-6 min-w-0 xl:col-start-1 xl:row-start-1 xl:row-span-2">
          <ArticlePreview article={article} />
          <ArticleAuditHistory trail={audit.data} isLoading={audit.isLoading} error={audit.error} />
        </div>

        <div className="min-w-0 xl:col-start-2 xl:row-start-2">
          <ArticleMetaPanel article={article} />
        </div>
      </div>
    </div>
  )
}
