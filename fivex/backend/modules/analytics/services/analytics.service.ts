import { WAITLIST_INTERESTS } from '../../prelaunch/constants/waitlistInterest.js'
import { analyticsRepository, type DateRange } from '../repositories/analytics.repository.js'

const DAY_MS = 24 * 60 * 60 * 1000

export interface AnalyticsOverview {
  generatedAt: string
  waitlist: {
    total: number
    last7Days: number
    last30Days: number
    previous30Days: number
    growthPercent: number | null
    byInterest: Record<(typeof WAITLIST_INTERESTS)[number] | 'unspecified', number>
    daily: Array<{ date: string; count: number }>
  }
  accounts: {
    total: number
    verified: number
    unverified: number
    last30Days: number
    previous30Days: number
    growthPercent: number | null
    byRole: Record<string, number>
  }
  articles: {
    total: number
    published: number
    pending: number
    draft: number
    views: number
  }
  engagement: {
    likes: number
    dislikes: number
    comments: number
    commentsLast30Days: number
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

// Windows are whole UTC days ending today, so the daily series and the 7/30-day totals always agree.
function windowEndingToday(today: Date, days: number, daysBack = 0): DateRange {
  const tomorrow = new Date(startOfUtcDay(today).getTime() + DAY_MS)
  const to = new Date(tomorrow.getTime() - daysBack * DAY_MS)
  return { from: new Date(to.getTime() - days * DAY_MS), to }
}

// null when there is nothing to compare against, so the UI can say "New" instead of dividing by zero.
export function growthPercent(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

function dayLabels(range: DateRange): string[] {
  const labels: string[] = []
  for (let time = range.from.getTime(); time < range.to.getTime(); time += DAY_MS) {
    labels.push(new Date(time).toISOString().slice(0, 10))
  }
  return labels
}

export const analyticsService = {
  async getOverview(now: Date = new Date()): Promise<AnalyticsOverview> {
    const last7 = windowEndingToday(now, 7)
    const last30 = windowEndingToday(now, 30)
    const previous30 = windowEndingToday(now, 30, 30)

    const [
      waitlistTotal,
      waitlist7,
      waitlist30,
      waitlistPrev30,
      interests,
      dailyRows,
      accountTotals,
      accounts30,
      accountsPrev30,
      articleTotals,
      commentsTotal,
      comments30,
    ] = await Promise.all([
      analyticsRepository.countWaitlistTotal(),
      analyticsRepository.countWaitlistBetween(last7),
      analyticsRepository.countWaitlistBetween(last30),
      analyticsRepository.countWaitlistBetween(previous30),
      analyticsRepository.waitlistByInterest(),
      analyticsRepository.waitlistDaily(last30),
      analyticsRepository.accountTotals(),
      analyticsRepository.countAccountsBetween(last30),
      analyticsRepository.countAccountsBetween(previous30),
      analyticsRepository.articleTotals(),
      analyticsRepository.countComments(),
      analyticsRepository.countComments(last30),
    ])

    const byInterest = { reader: 0, author: 0, editor: 0, organization: 0, unspecified: 0 }
    for (const { interest, count } of interests) {
      const key = WAITLIST_INTERESTS.find((known) => known === interest) ?? 'unspecified'
      byInterest[key] += count
    }

    const dailyByDate = new Map(dailyRows.map((row) => [row.date, row.count]))
    const daily = dayLabels(last30).map((date) => ({ date, count: dailyByDate.get(date) ?? 0 }))

    const statusCount = (status: string) => articleTotals.byStatus.find((row) => row.status === status)?.count ?? 0

    return {
      generatedAt: now.toISOString(),
      waitlist: {
        total: waitlistTotal,
        last7Days: waitlist7,
        last30Days: waitlist30,
        previous30Days: waitlistPrev30,
        growthPercent: growthPercent(waitlist30, waitlistPrev30),
        byInterest,
        daily,
      },
      accounts: {
        total: accountTotals.total,
        verified: accountTotals.verified,
        unverified: accountTotals.total - accountTotals.verified,
        last30Days: accounts30,
        previous30Days: accountsPrev30,
        growthPercent: growthPercent(accounts30, accountsPrev30),
        byRole: Object.fromEntries(accountTotals.byRole.map(({ role, count }) => [role, count])),
      },
      articles: {
        total: articleTotals.byStatus.reduce((sum, row) => sum + row.count, 0),
        published: statusCount('published'),
        pending: statusCount('pending_review'),
        draft: statusCount('draft'),
        views: articleTotals.views,
      },
      engagement: {
        likes: articleTotals.likes,
        dislikes: articleTotals.dislikes,
        comments: commentsTotal,
        commentsLast30Days: comments30,
      },
    }
  },
}
