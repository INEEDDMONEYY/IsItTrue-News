import { Article } from '../../articles/models/Article.js'
import { Comment } from '../../comments/models/Comment.js'
import { User } from '../../users/models/User.js'
import { WaitlistSignup } from '../../prelaunch/models/WaitlistSignup.js'

export interface DateRange {
  from: Date
  to: Date
}

export interface DailyCount {
  date: string
  count: number
}

// Read-only reporting queries. They live in this module because analytics spans several
// collections; nothing here ever writes.
export const analyticsRepository = {
  async countWaitlistBetween({ from, to }: DateRange): Promise<number> {
    return WaitlistSignup.countDocuments({ createdAt: { $gte: from, $lt: to } })
  },

  async countWaitlistTotal(): Promise<number> {
    return WaitlistSignup.estimatedDocumentCount()
  },

  async waitlistByInterest(): Promise<Array<{ interest: string | null; count: number }>> {
    const rows = await WaitlistSignup.aggregate<{ _id: string | null; count: number }>([
      { $group: { _id: { $ifNull: ['$interest', null] }, count: { $sum: 1 } } },
    ])
    return rows.map((row) => ({ interest: row._id, count: row.count }))
  },

  // Counts per UTC day inside the range; days with no signups are simply absent.
  async waitlistDaily({ from, to }: DateRange): Promise<DailyCount[]> {
    const rows = await WaitlistSignup.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: from, $lt: to } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
          count: { $sum: 1 },
        },
      },
    ])
    return rows.map((row) => ({ date: row._id, count: row.count }))
  },

  async countAccountsBetween({ from, to }: DateRange): Promise<number> {
    return User.countDocuments({ createdAt: { $gte: from, $lt: to } })
  },

  async accountTotals(): Promise<{ total: number; verified: number; byRole: Array<{ role: string; count: number }> }> {
    const [total, verified, roles] = await Promise.all([
      User.estimatedDocumentCount(),
      User.countDocuments({ isEmailVerified: true }),
      User.aggregate<{ _id: string; count: number }>([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ])
    return { total, verified, byRole: roles.map((row) => ({ role: row._id, count: row.count })) }
  },

  async articleTotals(): Promise<{
    byStatus: Array<{ status: string; count: number }>
    views: number
    likes: number
    dislikes: number
  }> {
    const [byStatus, sums] = await Promise.all([
      Article.aggregate<{ _id: string; count: number }>([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Article.aggregate<{ views: number; likes: number; dislikes: number }>([
        {
          $group: {
            _id: null,
            views: { $sum: '$views' },
            likes: { $sum: '$likesCount' },
            dislikes: { $sum: '$dislikesCount' },
          },
        },
      ]),
    ])
    const totals = sums[0] ?? { views: 0, likes: 0, dislikes: 0 }
    return {
      byStatus: byStatus.map((row) => ({ status: row._id, count: row.count })),
      views: totals.views,
      likes: totals.likes,
      dislikes: totals.dislikes,
    }
  },

  async countComments(range?: DateRange): Promise<number> {
    return range
      ? Comment.countDocuments({ createdAt: { $gte: range.from, $lt: range.to } })
      : Comment.estimatedDocumentCount()
  },
}
