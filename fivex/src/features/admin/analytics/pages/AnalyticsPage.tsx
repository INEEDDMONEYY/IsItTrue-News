import { BarChart3, TrendingUp, UserPlus, Users as UsersIcon } from 'lucide-react'
import { useUsersList } from '../../hooks/useUsersList'
import { useAuthorArticles } from '@/features/authors/hooks/useAuthorArticles'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { StatCard } from '@/components/cards'
import { RatioDonutCard } from '../components/RatioDonutCard'

// Comments and likes don't have a real data source yet — these are
// illustrative counts until those APIs are connected.
const MOCK_COMMENT_RATIO = { approved: 842, flagged: 58 }
const MOCK_LIKE_RATIO = { liked: 6320, reported: 140 }

export function AnalyticsPage() {
  const { data: users, isLoading, error } = useUsersList()
  const { articles } = useAuthorArticles()

  const totalUsers = users?.length ?? 0
  const verifiedUsers = users?.filter((u) => u.isEmailVerified).length ?? 0
  const verifiedRate = totalUsers ? Math.round((verifiedUsers / totalUsers) * 100) : 0

  const publishedArticles = articles.filter((a) => a.status === 'published').length
  const unpublishedArticles = articles.length - publishedArticles

  return (
    <div>
      <h1 className="text-2xl font-semibold text-heading mb-1">Analytics</h1>
      <p className="text-sm text-text-muted mb-6">
        Platform-wide account, content, and engagement ratios.
      </p>

      {isLoading && <p className="text-sm text-text-muted">Loading analytics...</p>}
      {error && <p className="text-sm text-disputed">{getErrorMessage(error, 'Failed to load analytics.')}</p>}

      {users && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Accounts" value={totalUsers} icon={UsersIcon} />
            <StatCard label="Verified Rate" value={`${verifiedRate}%`} icon={UserPlus} />
            <StatCard label="Growth (30d)" value="—" icon={TrendingUp} />
            <StatCard label="Article Views" value="—" icon={BarChart3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RatioDonutCard
              title="Sign-Up Ratio"
              primaryLabel="Verified"
              primaryValue={verifiedUsers}
              secondaryLabel="Unverified"
              secondaryValue={totalUsers - verifiedUsers}
              color="var(--color-chart-pink)"
            />
            <RatioDonutCard
              title="Article Ratio"
              primaryLabel="Published"
              primaryValue={publishedArticles}
              secondaryLabel="Draft / Pending"
              secondaryValue={unpublishedArticles}
              color="var(--color-chart-purple)"
            />
            <RatioDonutCard
              title="Comment Ratio"
              primaryLabel="Approved"
              primaryValue={MOCK_COMMENT_RATIO.approved}
              secondaryLabel="Flagged"
              secondaryValue={MOCK_COMMENT_RATIO.flagged}
              color="var(--color-chart-cyan)"
            />
            <RatioDonutCard
              title="Like Ratio"
              primaryLabel="Liked"
              primaryValue={MOCK_LIKE_RATIO.liked}
              secondaryLabel="Reported"
              secondaryValue={MOCK_LIKE_RATIO.reported}
              color="var(--color-chart-blue)"
            />
          </div>

          <p className="text-xs text-text-dim mt-4">
            Comment and like ratios are illustrative until those APIs are connected.
          </p>
        </>
      )}
    </div>
  )
}

