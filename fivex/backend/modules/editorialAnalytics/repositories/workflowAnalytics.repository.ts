import { Article } from '../../articles/models/Article.js'
import { ArticleAuditLog } from '../../articles/models/ArticleAuditLog.js'
import { ARTICLE_STATUSES } from '../../articles/constants/articleStatus.js'
import type { DateRange } from '../validations/editorialAnalytics.validation.js'

export interface StageSnapshotRow {
  stage: string | null
  open: number
  overdue: number
  submitted: number
  msSinceSubmission: number
}

export const workflowAnalyticsRepository = {
  // Current snapshot of articles that are not yet published, grouped by editorial stage. Not limited to the range.
  stageSnapshot(now: Date): Promise<StageSnapshotRow[]> {
    return Article.aggregate<StageSnapshotRow>([
      { $match: { status: { $ne: ARTICLE_STATUSES.PUBLISHED } } },
      {
        $group: {
          _id: '$editorialStage',
          open: { $sum: 1 },
          overdue: {
            $sum: { $cond: [{ $and: [{ $ne: ['$editorialDeadline', null] }, { $lt: ['$editorialDeadline', now] }] }, 1, 0] },
          },
          submitted: { $sum: { $cond: [{ $ne: ['$submittedAt', null] }, 1, 0] } },
          msSinceSubmission: {
            $sum: { $cond: [{ $ne: ['$submittedAt', null] }, { $subtract: [now, '$submittedAt'] }, 0] },
          },
        },
      },
      { $project: { _id: 0, stage: '$_id', open: 1, overdue: 1, submitted: 1, msSinceSubmission: 1 } },
    ])
  },

  // Articles sent back for revision per UTC day, from the audit log that records every decision.
  dailyReturns(range: DateRange): Promise<Array<{ day: string; returned: number }>> {
    return ArticleAuditLog.aggregate<{ day: string; returned: number }>([
      { $match: { action: 'changes_requested', createdAt: { $gte: range.start, $lt: range.end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
          returned: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: '$_id', returned: 1 } },
    ])
  },

  // Latest editor decisions for the activity feed. Limited to the range and to the decision actions.
  recentDecisions(range: DateRange, limit: number) {
    return ArticleAuditLog.find({
      action: { $in: ['approved', 'changes_requested'] },
      createdAt: { $gte: range.start, $lt: range.end },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('article articleTitle action actorRole createdAt')
      .lean()
  },
}
