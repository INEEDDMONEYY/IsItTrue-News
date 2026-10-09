export type WaitlistInterestKey = 'reader' | 'author' | 'editor' | 'organization' | 'unspecified'

// Mirrors GET /api/analytics/overview (backend/modules/analytics/services/analytics.service.ts).
export interface AnalyticsOverview {
  generatedAt: string
  waitlist: {
    total: number
    last7Days: number
    last30Days: number
    previous30Days: number
    growthPercent: number | null
    byInterest: Record<WaitlistInterestKey, number>
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
