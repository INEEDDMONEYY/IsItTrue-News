import { BarChart3, CalendarDays, MessageSquare, Eye, TrendingUp, UserPlus, Users as UsersIcon, Mail } from 'lucide-react'
import { PageLoader } from '@/components/loaders/PageLoader'
import { StatCard } from '@/components/cards'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { InterestBreakdown } from '../components/InterestBreakdown'
import { RatioDonutCard } from '../components/RatioDonutCard'
import { SignupsChart } from '../components/SignupsChart'
import { useAdminAnalytics } from '../hooks/useAdminAnalytics'
import { formatGrowth } from '../utils/formatGrowth'

export function AnalyticsPage() {
  const { data, isLoading, error } = useAdminAnalytics()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Analytics</h1>
      <p className="text-sm text-text-muted mb-6">
        Early-access sign-ups, accounts, content, and engagement, live from the platform.
      </p>

      {isLoading && <PageLoader label="Loading analytics..." />}
      {error && <p role="alert" className="text-sm text-disputed">{getErrorMessage(error, 'Failed to load analytics.')}</p>}

      {data && (
        <div className="flex flex-col gap-8">
          <section aria-labelledby="waitlist-heading">
            <h2 id="waitlist-heading" className="text-lg font-semibold text-heading mb-3">
              Early-access waitlist
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              <StatCard label="Total Sign-Ups" value={data.waitlist.total.toLocaleString()} icon={Mail} />
              <StatCard label="Last 7 Days" value={data.waitlist.last7Days.toLocaleString()} icon={CalendarDays} />
              <StatCard label="Last 30 Days" value={data.waitlist.last30Days.toLocaleString()} icon={UserPlus} />
              <StatCard
                label="Growth vs Previous 30d"
                value={formatGrowth(data.waitlist.growthPercent, data.waitlist.last30Days)}
                icon={TrendingUp}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
              <SignupsChart data={data.waitlist.daily} />
              <InterestBreakdown byInterest={data.waitlist.byInterest} />
            </div>
          </section>

          <section aria-labelledby="platform-heading">
            <h2 id="platform-heading" className="text-lg font-semibold text-heading mb-3">
              Platform
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              <StatCard label="Total Accounts" value={data.accounts.total.toLocaleString()} icon={UsersIcon} />
              <StatCard
                label="Account Growth (30d)"
                value={formatGrowth(data.accounts.growthPercent, data.accounts.last30Days)}
                icon={TrendingUp}
              />
              <StatCard label="Article Views" value={data.articles.views.toLocaleString()} icon={Eye} />
              <StatCard
                label="Comments (30d)"
                value={`${data.engagement.commentsLast30Days.toLocaleString()} of ${data.engagement.comments.toLocaleString()}`}
                icon={MessageSquare}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RatioDonutCard
                title="Sign-Up Ratio"
                primaryLabel="Verified"
                primaryValue={data.accounts.verified}
                secondaryLabel="Unverified"
                secondaryValue={data.accounts.unverified}
                color="var(--color-chart-pink)"
              />
              <RatioDonutCard
                title="Article Ratio"
                primaryLabel="Published"
                primaryValue={data.articles.published}
                secondaryLabel="Draft / Pending"
                secondaryValue={data.articles.draft + data.articles.pending}
                color="var(--color-chart-purple)"
              />
              <RatioDonutCard
                title="Reaction Ratio"
                primaryLabel="Likes"
                primaryValue={data.engagement.likes}
                secondaryLabel="Dislikes"
                secondaryValue={data.engagement.dislikes}
                color="var(--color-chart-blue)"
              />
              <div className="rounded-2xl border border-card-border bg-card p-5">
                <div className="mb-3 flex items-center gap-2 text-card-heading">
                  <BarChart3 aria-hidden="true" className="size-4 text-accent" />
                  <h2 className="text-sm font-semibold">Accounts by role</h2>
                </div>
                <ul className="flex flex-col gap-2 text-sm">
                  {Object.entries(data.accounts.byRole)
                    .sort(([, a], [, b]) => b - a)
                    .map(([role, count]) => (
                      <li key={role} className="flex items-center justify-between">
                        <span className="capitalize text-card-text-muted">{role}</span>
                        <span className="font-medium text-card-heading">{count.toLocaleString()}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </section>

          <p className="text-xs text-text-dim">
            Updated {new Date(data.generatedAt).toLocaleTimeString()}. Days are counted in UTC. Flagged-comment and
            reported-like ratios will appear once the platform records moderation reports.
          </p>
        </div>
      )}
    </div>
  )
}
