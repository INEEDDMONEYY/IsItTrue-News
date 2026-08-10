import { BarChart3, Eye, FileText, MessageSquare } from 'lucide-react'
import { useAuthorArticles } from '../hooks/useAuthorArticles'
import { StatCard } from '@/components/cards'
import { ViewsTrendChart } from '../components/charts/ViewsTrendChart'
import { DonutChart } from '../components/charts/DonutChart'
import { buildViewsTrend, buildStatusBreakdown, buildCategoryBreakdown } from '../components/charts/chartData'

const STATUS_COLORS: Record<string, string> = {
  published: 'var(--color-chart-cyan)',
  pending_review: 'var(--color-chart-purple)',
  draft: 'var(--color-card-text-dim)',
}

const CATEGORY_PALETTE = [
  'var(--color-chart-pink)',
  'var(--color-chart-purple)',
  'var(--color-chart-cyan)',
  'var(--color-chart-blue)',
]

export function AuthorAnalyticsPage() {
  const { articles } = useAuthorArticles()

  const published = articles.filter((a) => a.status === 'published')
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0)
  const avgViews = published.length ? Math.round(totalViews / published.length) : 0
  const estimatedInteractions = Math.round(totalViews * 0.015)
  const maxViews = Math.max(1, ...articles.map((a) => a.views))
  const rankedArticles = [...articles].sort((a, b) => b.views - a.views)

  const trend = buildViewsTrend(articles)
  const statusBreakdown = buildStatusBreakdown(articles).map((s) => ({
    label: s.status.replace('_', ' '),
    value: s.count,
    color: STATUS_COLORS[s.status] ?? 'var(--color-card-text-dim)',
  }))
  const categoryBreakdown = buildCategoryBreakdown(articles).map((c, i) => ({
    label: c.category,
    value: c.count,
    color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
  }))

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Analytics</h1>
      <p className="text-sm text-text-muted mb-6">
        Performance and interactions across the articles you&apos;ve published.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} />
        <StatCard label="Published Articles" value={published.length} icon={FileText} />
        <StatCard label="Avg. Views / Article" value={avgViews.toLocaleString()} icon={BarChart3} />
        <StatCard
          label="Interactions (est.)"
          value={estimatedInteractions.toLocaleString()}
          icon={MessageSquare}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="xl:col-span-2 rounded-2xl border border-card-border bg-card p-5">
          <h2 className="text-sm font-semibold text-card-heading mb-4">Views Over Time</h2>
          <ViewsTrendChart data={trend} />
        </div>

        <div className="rounded-2xl border border-card-border bg-card p-5">
          <h2 className="text-sm font-semibold text-card-heading mb-4">Articles by Status</h2>
          <DonutChart slices={statusBreakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-card-border bg-card p-5">
          <h2 className="text-sm font-semibold text-card-heading mb-4">Articles by Category</h2>
          <DonutChart slices={categoryBreakdown} />
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-card-border bg-card p-5">
          <h2 className="text-sm font-semibold text-card-heading mb-4">Views by Article</h2>
          {rankedArticles.length === 0 ? (
            <p className="text-sm text-card-text-muted">You haven&apos;t created any articles yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {rankedArticles.map((article) => (
                <div key={article.id} className="flex items-center gap-3">
                  <span className="w-32 sm:w-40 truncate text-xs text-card-text-muted" title={article.title}>
                    {article.title || 'Untitled'}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-card-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(article.views / maxViews) * 100}%`,
                        background: 'linear-gradient(90deg, var(--color-chart-purple), var(--color-chart-cyan))',
                      }}
                    />
                  </div>
                  <span className="w-16 text-xs text-card-text-muted text-right">
                    {article.views.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-text-dim">
        Interaction figures are illustrative until the analytics backend is connected.
      </p>
    </div>
  )
}