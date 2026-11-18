
import { Link } from 'react-router-dom'
import {
  Plus,
  ArrowRight,
  Megaphone,
  Image,
  BarChart3,
  Clock3,
  CheckCircle2,
  FileText,
  Eye,
  MousePointerClick,
} from 'lucide-react'

import { LoaderState } from '@/components/loaders/LoaderState'
import { PageLoader } from '@/components/loaders/PageLoader'
import { AdvertiserPageHeader } from '../components/AdvertiserPageHeader'
import { AdvertiserStatCard } from '../components/AdvertiserStatCard'
import { VendorListingPreview } from '../components/VendorListingPreview'
import { useAdSlots } from '../hooks/useAdSlots'
import { useAdvertiserOverview } from '../hooks/useAdvertiserOverview'
import type { AdvertiserActivityType } from '../types/advertiser.types'
import {
  PLACEMENT_LABELS,
  STATUS_LABELS,
  campaignRef,
  formatCount,
  formatMoney,
  timeAgo,
} from '../utils/format'
import { STATUS_ICONS as statusIcons, STATUS_STYLES as statusStyles, hasNoDelivery } from '../utils/statusStyles'

const activityIcons: Record<AdvertiserActivityType, typeof Megaphone> = {
  campaign: Megaphone,
  approval: CheckCircle2,
  billing: FileText,
  review: Image,
}

export function AdvertiserDashboardPage() {
  const overview = useAdvertiserOverview()
  const slots = useAdSlots()
  const data = overview.data

  const stats = data
    ? [
        { label: 'Total Impressions', value: formatCount(data.stats.totalImpressions), description: 'Across all campaigns', icon: Eye },
        { label: 'Total Clicks', value: formatCount(data.stats.totalClicks), description: 'Across all campaigns', icon: MousePointerClick },
        { label: 'Active Campaigns', value: formatCount(data.stats.activeCampaigns), description: 'Currently running', icon: Megaphone },
        { label: 'Pending Review', value: formatCount(data.stats.pendingReview), description: 'Awaiting approval', icon: Clock3 },
      ]
    : []
  const campaigns = data?.campaigns ?? []
  const activities = data?.activity ?? []

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-7 sm:space-y-8">
      {/* Page heading */}
      <AdvertiserPageHeader
        title="Welcome to your advertiser workspace"
        description="Manage your campaigns, monitor performance, and grow your brand on IITNews."
      >
        <Link
          to="/advertiser/campaigns/new"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Advertisement
        </Link>
      </AdvertiserPageHeader>

      {overview.isLoading && <PageLoader label="Loading your workspace..." />}

      {overview.isError && (
        <LoaderState
          alert
          title="We couldn't load your dashboard"
          message="Your campaign data isn't available right now. Please try again in a moment."
        >
          <button
            type="button"
            onClick={() => overview.refetch()}
            className="text-sm font-semibold text-primary underline underline-offset-2 hover:no-underline"
          >
            Try again
          </button>
        </LoaderState>
      )}

      {data && (
      <>
      {/* Statistics */}
      <section aria-label="Advertising statistics">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Advertising overview
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            A snapshot of your advertising activity.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <AdvertiserStatCard
              key={stat.label}
              {...stat}
            />
          ))}
        </div>
      </section>

      {/* Vendor listing preview */}
      <VendorListingPreview />

      {/* Quick actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Quick actions
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Get to your advertising tools quickly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickAction
            to="/advertiser/campaigns/new"
            icon={Plus}
            title="Create campaign"
            description="Start a new advertising campaign."
          />

          <QuickAction
            to="/advertiser/campaigns"
            icon={Megaphone}
            title="Manage campaigns"
            description="Review and manage your advertisements."
          />

          <QuickAction
            to="/advertiser/analytics"
            icon={BarChart3}
            title="View analytics"
            description="Explore your advertising performance."
          />
        </div>
      </section>

      {/* Campaigns */}
      <section className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Recent campaigns
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Your latest advertising campaigns.
            </p>
          </div>

          <Link
            to="/advertiser/campaigns"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {campaigns.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm font-semibold text-foreground">No campaigns yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Campaigns you create will appear here with their status and performance.
            </p>
            <Link
              to="/advertiser/campaigns/new"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Create your first campaign
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Mobile campaign cards */}
        <div className={`space-y-3 md:hidden ${campaigns.length === 0 ? 'hidden' : ''}`}>
          {campaigns.map((campaign) => {
            const StatusIcon = statusIcons[campaign.status]
            const noDelivery = hasNoDelivery(campaign.status)

            return (
              <div
                key={campaign.id}
                className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-all text-[10px] font-medium text-muted-foreground">
                      {campaignRef(campaign.id)}
                    </p>
                    <h3 className="mt-1 break-words text-sm font-semibold text-foreground">
                      {campaign.name}
                    </h3>
                    <p className="mt-1 break-words text-xs text-muted-foreground">
                      {PLACEMENT_LABELS[campaign.placement]}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyles[campaign.status]}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {STATUS_LABELS[campaign.status]}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      Impressions
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-foreground">
                      {noDelivery ? '—' : formatCount(campaign.impressions)}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      Clicks
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-foreground">
                      {noDelivery ? '—' : formatCount(campaign.clicks)}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      Budget
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatMoney(campaign.budgetCents)}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      Last update
                    </p>
                    <p className="mt-1 break-words text-xs font-medium text-foreground">
                      {timeAgo(campaign.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tablet and desktop campaign table */}
        <div className={`hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${campaigns.length === 0 ? '' : 'md:block'}`}>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground">
                    Campaign
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                    Impressions
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                    Clicks
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                    Budget
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                    Updated
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {campaigns.map((campaign) => {
                  const StatusIcon = statusIcons[campaign.status]
                  const noDelivery = hasNoDelivery(campaign.status)

                  return (
                    <tr
                      key={campaign.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-foreground">
                          {campaign.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {PLACEMENT_LABELS[campaign.placement]}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[campaign.status]}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {STATUS_LABELS[campaign.status]}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-foreground">
                        {noDelivery ? '—' : formatCount(campaign.impressions)}
                      </td>

                      <td className="px-4 py-4 text-sm text-foreground">
                        {noDelivery ? '—' : formatCount(campaign.clicks)}
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-foreground">
                        {formatMoney(campaign.budgetCents)}
                      </td>

                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        {timeAgo(campaign.updatedAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Activity */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-foreground">
              Recent activity
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Recent updates across your advertiser account.
            </p>
          </div>

          <div className="space-y-5">
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nothing yet. Updates about your campaigns will show up here.
              </p>
            )}

            {activities.map((activity) => {
              const ActivityIcon = activityIcons[activity.type]

              return (
                <div
                  key={activity.id}
                  className="flex min-w-0 items-start gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <ActivityIcon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <p className="break-words text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {timeAgo(activity.at)}
                      </span>
                    </div>

                    <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Account assistance */}
        <div className="flex min-w-0 flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Megaphone className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-base font-semibold text-foreground">
              Ready to reach more readers?
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Create an advertisement and introduce your business,
              organization, product, or initiative to the IITNews audience.
            </p>
          </div>

          <Link
            to="/advertiser/campaigns/new"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:w-fit"
          >
            Start a campaign
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Ad slot availability */}
      {slots.data && slots.data.length > 0 && (
        <section className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold text-foreground">Ad slot availability</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            See which placements remain open and where, before you buy.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {slots.data.map((slot) => (
              <div key={slot.placement} className="min-w-0 rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-foreground">{PLACEMENT_LABELS[slot.placement]}</p>
                <ul className="mt-3 space-y-2">
                  {slot.pages.map((page) => (
                    <li key={page.page} className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">{page.label}</span>
                      <span
                        className={
                          page.open > 0
                            ? 'font-medium text-emerald-600 dark:text-emerald-400'
                            : 'font-medium text-destructive'
                        }
                      >
                        {page.open > 0 ? `${page.open} of ${page.capacity} open` : 'Sold out'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
      </>
      )}
    </div>
  )
}

interface QuickActionProps {
  to: string
  icon: React.ElementType
  title: string
  description: string
}

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
}: QuickActionProps) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99] sm:gap-4 sm:p-5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-semibold text-foreground">
          {title}
        </p>
        <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  )
}
