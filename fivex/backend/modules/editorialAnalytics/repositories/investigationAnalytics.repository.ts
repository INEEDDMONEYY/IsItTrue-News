import { Investigation } from '../../investigations/models/Investigation.js'
import { Evidence } from '../../investigations/models/Evidence.js'
import type { DateRange } from '../validations/editorialAnalytics.validation.js'

export interface InvestigationSnapshotRow {
  status: string
  workflowStage: string | null
  count: number
  overdue: number
}

const CLOSED_STATUSES = ['published', 'rejected']

export const investigationAnalyticsRepository = {
  // Current state of every investigation. Overdue means an editorial deadline has passed and the investigation is still open.
  snapshot(now: Date): Promise<InvestigationSnapshotRow[]> {
    return Investigation.aggregate<InvestigationSnapshotRow>([
      {
        $group: {
          _id: { status: '$status', workflowStage: '$workflowStage' },
          count: { $sum: 1 },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $not: [{ $in: ['$status', CLOSED_STATUSES] }] },
                    { $ne: ['$editorialDeadline', null] },
                    { $lt: ['$editorialDeadline', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id.status',
          workflowStage: '$_id.workflowStage',
          count: 1,
          overdue: 1,
        },
      },
    ])
  },

  // Investigations published in the range, with hours from creation to publication.
  completionTime(range: DateRange): Promise<{ count: number; totalHours: number }> {
    return Investigation.aggregate<{ count: number; totalHours: number }>([
      { $match: { status: 'published', publishedAt: { $gte: range.start, $lt: range.end } } },
      { $project: { hours: { $divide: [{ $subtract: ['$publishedAt', '$createdAt'] }, 3600000] } } },
      { $match: { hours: { $gte: 0 } } },
      { $group: { _id: null, count: { $sum: 1 }, totalHours: { $sum: '$hours' } } },
      { $project: { _id: 0, count: 1, totalHours: 1 } },
    ]).then((rows) => rows[0] ?? { count: 0, totalHours: 0 })
  },

  // Evidence records added in the range, by kind and visibility. Counts only; no file or content fields are read.
  evidenceBreakdown(range: DateRange): Promise<Array<{ kind: string; visibility: string; count: number }>> {
    return Evidence.aggregate<{ kind: string; visibility: string; count: number }>([
      { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
      { $group: { _id: { kind: '$kind', visibility: '$visibility' }, count: { $sum: 1 } } },
      { $project: { _id: 0, kind: '$_id.kind', visibility: '$_id.visibility', count: 1 } },
    ])
  },

  // Evidence records added per UTC day.
  dailyEvidence(range: DateRange): Promise<Array<{ day: string; evidence: number }>> {
    return Evidence.aggregate<{ day: string; evidence: number }>([
      { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
          evidence: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: '$_id', evidence: 1 } },
    ])
  },

  // Open investigations per lead author. Counts only; the name comes from the users collection like the author report.
  openByAuthor(limit: number): Promise<Array<{ authorId: string; authorName: string | null; open: number }>> {
    return Investigation.aggregate<{ authorId: string; authorName: string | null; open: number }>([
      { $match: { status: { $in: ['draft', 'pending_review'] } } },
      { $group: { _id: '$author', open: { $sum: 1 } } },
      { $sort: { open: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'authorDoc' } },
      {
        $project: {
          _id: 0,
          authorId: { $toString: '$_id' },
          authorName: { $ifNull: [{ $arrayElemAt: ['$authorDoc.name', 0] }, null] },
          open: 1,
        },
      },
    ])
  },
}
