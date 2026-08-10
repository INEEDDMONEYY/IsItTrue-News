import { BarChart3, Eye, MessageSquare, ShieldCheck } from 'lucide-react'
import { StatCard, EmptyStateCard } from '@/components/cards'

export function EditorAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Analytics</h1>
      <p className="text-sm text-text-muted mb-6">
        Content performance across everything your desk has published.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Articles Published" value="128" icon={ShieldCheck} />
        <StatCard label="Total Views (30d)" value="42.6K" icon={Eye} />
        <StatCard label="Comments (30d)" value="1,204" icon={MessageSquare} />
        <StatCard label="Fact Checks Issued" value="36" icon={BarChart3} />
      </div>

      <EmptyStateCard
        icon={BarChart3}
        title="Detailed charts are coming soon"
        description="Trend charts and per-article breakdowns will appear here once the articles API is connected. Figures above are illustrative."
      />
    </div>
  )
}
