import { Types } from 'mongoose'
import { Article } from '../../articles/models/Article.js'
import { ArticleView } from '../../articles/models/ArticleView.js'
import { ArticleAuditLog } from '../../articles/models/ArticleAuditLog.js'
import { Correction } from '../../corrections/models/Correction.js'
import { ARTICLE_STATUSES } from '../../articles/constants/articleStatus.js'
import type { DateRange } from '../validations/editorialAnalytics.validation.js'

const submittedInRange = (range: DateRange) => ({ submittedAt: { $gte: range.start, $lt: range.end } })

// Each query is a database aggregation bounded by the date range. Nothing loads whole collections into memory.
export const editorialAnalyticsRepository = {
  countSubmitted(range: DateRange): Promise<number> {
    return Article.countDocuments(submittedInRange(range))
  },

  countPublishedFromSubmissions(range: DateRange): Promise<number> {
    return Article.countDocuments({ ...submittedInRange(range), status: ARTICLE_STATUSES.PUBLISHED })
  },

  // Returns are counted from the audit log, which keeps every decision. Article.reviewNote holds only the latest one.
  countReturned(range: DateRange): Promise<number> {
    return ArticleAuditLog.countDocuments({
      action: 'changes_requested',
      createdAt: { $gte: range.start, $lt: range.end },
    })
  },

  // A current snapshot, not limited to the range.
  countPendingReviews(now: Date): Promise<{ pending: number; overdue: number }> {
    return Article.aggregate<{ pending: number; overdue: number }>([
      { $match: { status: ARTICLE_STATUSES.PENDING_REVIEW } },
      {
        $group: {
          _id: null,
          pending: { $sum: 1 },
          overdue: { $sum: { $cond: [{ $and: [{ $ne: ['$editorialDeadline', null] }, { $lt: ['$editorialDeadline', now] }] }, 1, 0] } },
        },
      },
      { $project: { _id: 0, pending: 1, overdue: 1 } },
    ]).then((rows) => rows[0] ?? { pending: 0, overdue: 0 })
  },

  async distinctActiveAuthors(range: DateRange): Promise<number> {
    const authors = await Article.distinct('author', submittedInRange(range))
    return authors.length
  },

  // Average hours from submission to the latest editor decision, for articles with both timestamps in range.
  turnaroundStats(range: DateRange): Promise<{ count: number; totalHours: number }> {
    return Article.aggregate<{ count: number; totalHours: number }>([
      { $match: { ...submittedInRange(range), reviewedAt: { $gte: range.start, $lt: range.end } } },
      { $project: { diff: { $subtract: ['$reviewedAt', '$submittedAt'] } } },
      { $match: { diff: { $gte: 0 } } },
      { $group: { _id: null, count: { $sum: 1 }, totalMs: { $sum: '$diff' } } },
      { $project: { _id: 0, count: 1, totalHours: { $divide: ['$totalMs', 3600000] } } },
    ]).then((rows) => rows[0] ?? { count: 0, totalHours: 0 })
  },

  viewTotals(range: DateRange): Promise<{ views: number; readingCount: number; readingSeconds: number }> {
    return ArticleView.aggregate<{ views: number; readingCount: number; readingSeconds: number }>([
      { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
      {
        $group: {
          _id: null,
          views: { $sum: 1 },
          readingCount: { $sum: { $cond: [{ $gt: ['$readingSeconds', 0] }, 1, 0] } },
          readingSeconds: { $sum: '$readingSeconds' },
        },
      },
      { $project: { _id: 0, views: 1, readingCount: 1, readingSeconds: 1 } },
    ]).then((rows) => rows[0] ?? { views: 0, readingCount: 0, readingSeconds: 0 })
  },

  async uniqueVisitors(range: DateRange): Promise<number> {
    const rows = await ArticleView.aggregate<{ count: number }>([
      { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
      { $group: { _id: '$visitorHash' } },
      { $count: 'count' },
    ])
    return rows[0]?.count ?? 0
  },

  topReferrers(range: DateRange, limit: number): Promise<Array<{ host: string; views: number }>> {
    return ArticleView.aggregate<{ host: string; views: number }>([
      { $match: { createdAt: { $gte: range.start, $lt: range.end }, referrerHost: { $exists: true, $ne: null } } },
      { $group: { _id: '$referrerHost', views: { $sum: 1 } } },
      { $sort: { views: -1, _id: 1 } },
      { $limit: limit },
      { $project: { _id: 0, host: '$_id', views: 1 } },
    ])
  },

  dailySubmissions(range: DateRange): Promise<Array<{ day: string; submitted: number }>> {
    return Article.aggregate<{ day: string; submitted: number }>([
      { $match: submittedInRange(range) },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt', timezone: 'UTC' } }, submitted: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: '$_id', submitted: 1 } },
    ])
  },

  dailyViews(range: DateRange): Promise<Array<{ day: string; views: number; visitors: number }>> {
    return ArticleView.aggregate<{ day: string; views: number; visitors: number }>([
      { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
      {
        $group: {
          _id: '$dayKey',
          views: { $sum: 1 },
          visitorSet: { $addToSet: '$visitorHash' },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: '$_id', views: 1, visitors: { $size: '$visitorSet' } } },
    ])
  },

  // Per-author figures. Limited to the top authors by submissions so the response size stays bounded.
  authorPerformance(
    range: DateRange,
    limit: number,
  ): Promise<
    Array<{
      authorId: Types.ObjectId
      submitted: number
      published: number
      turnaroundCount: number
      turnaroundHours: number
      authorName: string | null
    }>
  > {
    return Article.aggregate([
      { $match: submittedInRange(range) },
      {
        $group: {
          _id: '$author',
          submitted: { $sum: 1 },
          published: { $sum: { $cond: [{ $eq: ['$status', ARTICLE_STATUSES.PUBLISHED] }, 1, 0] } },
          turnaroundSum: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$reviewedAt', null] }, { $gte: ['$reviewedAt', '$submittedAt'] }] },
                { $divide: [{ $subtract: ['$reviewedAt', '$submittedAt'] }, 3600000] },
                0,
              ],
            },
          },
          turnaroundCount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$reviewedAt', null] }, { $gte: ['$reviewedAt', '$submittedAt'] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { submitted: -1, _id: 1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'authorDoc' } },
      {
        $project: {
          _id: 0,
          authorId: '$_id',
          submitted: 1,
          published: 1,
          turnaroundCount: 1,
          turnaroundHours: '$turnaroundSum',
          authorName: { $ifNull: [{ $arrayElemAt: ['$authorDoc.name', 0] }, null] },
        },
      },
    ])
  },

  // Editor decisions made in range. Each decision is counted, so one article can contribute several.
  decisionCounts(range: DateRange): Promise<{ approved: number; changesRequested: number }> {
    return ArticleAuditLog.aggregate<{ approved: number; changesRequested: number }>([
      {
        $match: {
          action: { $in: ['approved', 'changes_requested'] },
          createdAt: { $gte: range.start, $lt: range.end },
        },
      },
      {
        $group: {
          _id: null,
          approved: { $sum: { $cond: [{ $eq: ['$action', 'approved'] }, 1, 0] } },
          changesRequested: { $sum: { $cond: [{ $eq: ['$action', 'changes_requested'] }, 1, 0] } },
        },
      },
      { $project: { _id: 0, approved: 1, changesRequested: 1 } },
    ]).then((rows) => rows[0] ?? { approved: 0, changesRequested: 0 })
  },

  // Revision frequency per article: how many articles received a return, and how many were returned more than once.
  async revisionFrequency(range: DateRange): Promise<{ reviewed: number; returnedOnce: number; returnedRepeatedly: number }> {
    const rows = await ArticleAuditLog.aggregate<{ reviewed: number; returnedOnce: number; returnedRepeatedly: number }>([
      {
        $match: {
          action: { $in: ['approved', 'changes_requested'] },
          createdAt: { $gte: range.start, $lt: range.end },
        },
      },
      {
        $group: {
          _id: '$article',
          returns: { $sum: { $cond: [{ $eq: ['$action', 'changes_requested'] }, 1, 0] } },
        },
      },
      {
        $group: {
          _id: null,
          reviewed: { $sum: 1 },
          returnedOnce: { $sum: { $cond: [{ $eq: ['$returns', 1] }, 1, 0] } },
          returnedRepeatedly: { $sum: { $cond: [{ $gte: ['$returns', 2] }, 1, 0] } },
        },
      },
      { $project: { _id: 0, reviewed: 1, returnedOnce: 1, returnedRepeatedly: 1 } },
    ])
    return rows[0] ?? { reviewed: 0, returnedOnce: 0, returnedRepeatedly: 0 }
  },

  countPublishedInRange(range: DateRange): Promise<number> {
    return Article.countDocuments({ status: ARTICLE_STATUSES.PUBLISHED, publishedAt: { $gte: range.start, $lt: range.end } })
  },

  countCorrectionsReported(range: DateRange): Promise<number> {
    return Correction.countDocuments({ createdAt: { $gte: range.start, $lt: range.end } })
  },

  // Corrections grouped by category and by status, for corrections reported in range.
  correctionBreakdown(
    range: DateRange,
    field: 'category' | 'status',
  ): Promise<Array<{ key: string; count: number }>> {
    return Correction.aggregate<{ key: string; count: number }>([
      { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $project: { _id: 0, key: '$_id', count: 1 } },
    ])
  },

  dailyCorrections(range: DateRange): Promise<Array<{ day: string; reported: number }>> {
    return Correction.aggregate<{ day: string; reported: number }>([
      { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, reported: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: '$_id', reported: 1 } },
    ])
  },
}
