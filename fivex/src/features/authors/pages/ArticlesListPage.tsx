import { Link } from 'react-router-dom'
import { Eye, FilePlus2, Trash2 } from 'lucide-react'
import { useAuthorArticles } from '../hooks/useAuthorArticles'
import { FactCheckIndicator } from '../components/FactCheckIndicator'
import type { ArticleStatus } from '../types/authorArticle.types'

const STATUS_STYLES: Record<ArticleStatus, { label: string; className: string }> = {
  published: { label: 'Published', className: 'bg-verified/10 text-verified border-verified/30' },
  pending_review: { label: 'Pending Review', className: 'bg-pending/10 text-pending border-pending/30' },
  draft: { label: 'Draft', className: 'bg-card-2 text-card-text-muted border-card-border' },
}

export function ArticlesListPage() {
  const { articles, deleteArticle } = useAuthorArticles()

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    deleteArticle(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="text-2xl font-semibold text-heading">My Articles</h1>
        <Link
          to="/dashboard/articles/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <FilePlus2 className="w-4 h-4" />
          New Article
        </Link>
      </div>
      <p className="text-sm text-text-muted mb-6">Drafts, submissions, and published stories.</p>

      <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-card-2 text-left text-card-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Fact-Check</th>
              <th className="px-4 py-3 font-medium">Views</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => {
              const status = STATUS_STYLES[article.status]
              return (
                <tr key={article.id} className="border-t border-card-border">
                  <td className="px-4 py-3 text-card-heading max-w-xs truncate">{article.title}</td>
                  <td className="px-4 py-3 text-card-text-muted">{article.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <FactCheckIndicator
                      status={article.factCheckStatus}
                      rejectionReason={article.factCheckRejectionReason}
                    />
                  </td>
                  <td className="px-4 py-3 text-card-text-muted">{article.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-card-text-muted">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {article.status === 'published' && (
                        <Link
                          to={`/article/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-card-text-muted hover:bg-surface-2 hover:text-accent transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(article.id, article.title)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-disputed hover:bg-surface-2 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {articles.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-card-text-muted">
                  You haven&apos;t written any articles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
