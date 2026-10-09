import { Link } from 'react-router-dom'
import { Eye, FilePlus2, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { PageLoader } from '@/components/loaders/PageLoader'
import { articlesApi } from '../api/articles.api'

// The real shape returned by GET /api/articles/mine (see
// backend/modules/articles/models/Article.ts's toJSON transform) — kept
// local to this page since the shared `AuthorArticle` mock type describes a
// richer workflow (editors, revisions, collaborators) the backend doesn't
// actually support yet.
interface MyArticle {
  id: string
  title: string
  slug: string
  category: string
  status: 'draft' | 'pending_review' | 'published'
  factCheckStatus: 'none' | 'pending' | 'approved' | 'rejected'
  reviewNote?: string
  createdAt: string
}

const STATUS_STYLES: Record<MyArticle['status'], { label: string; className: string }> = {
  published: { label: 'Published', className: 'bg-verified/10 text-verified border-verified/30' },
  pending_review: { label: 'In Review', className: 'bg-pending/10 text-pending border-pending/30' },
  draft: { label: 'Draft', className: 'bg-card-2 text-card-text-muted border-card-border' },
}

const FACT_CHECK_STYLES: Record<MyArticle['factCheckStatus'], { label: string; className: string } | null> = {
  none: null,
  pending: { label: 'Fact-check pending', className: 'bg-pending/10 text-pending border-pending/30' },
  approved: { label: 'Verified', className: 'bg-verified/10 text-verified border-verified/30' },
  rejected: { label: 'Issues found', className: 'bg-disputed/10 text-disputed border-disputed/30' },
}

export function ArticlesListPage() {
  const queryClient = useQueryClient()

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['authors', 'articles', 'mine'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ articles: MyArticle[] }>('/api/articles/mine')
      return data.articles
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => articlesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authors', 'articles', 'mine'] }),
  })

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    deleteMutation.mutate(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="text-2xl font-semibold text-heading">My Articles</h1>
        <Link
          to="/dashboard/articles/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-gradient text-on-brand text-sm font-medium transition-colors"
        >
          <FilePlus2 className="w-4 h-4" />
          New Article
        </Link>
      </div>
      <p className="text-sm text-text-muted mb-6">Drafts, submissions, and published stories.</p>

      {isLoading ? (
        <PageLoader label="Loading articles..." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-card-2 text-left text-card-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Fact-Check</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const status = STATUS_STYLES[article.status]
                const factCheck = FACT_CHECK_STYLES[article.factCheckStatus]
                return (
                  <tr key={article.id} className="border-t border-card-border">
                    <td className="px-4 py-3 text-card-heading max-w-xs">
                      <span className="block truncate">{article.title}</span>
                      {article.status === 'draft' && article.reviewNote && (
                        <span className="mt-1 block whitespace-normal text-xs text-disputed">
                          Editor note: {article.reviewNote}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-card-text-muted">{article.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {factCheck && (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${factCheck.className}`}>
                          {factCheck.label}
                        </span>
                      )}
                    </td>
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
                  <td colSpan={6} className="px-4 py-6 text-center text-card-text-muted">
                    You haven&apos;t written any articles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

