import { Claim } from '../../claims/models/Claim.js'
import { ClaimEvent } from '../../claims/models/ClaimEvent.js'
import { FactCheckRequest } from '../../factChecks/models/FactCheckRequest.js'
import type { DateRange } from '../validations/editorialAnalytics.validation.js'

export interface ClaimSnapshotRow {
  workflowStatus: string
  assessmentStatus: string
  count: number
  overdue: number
  unassigned: number
}

const assessmentActions = ['assessment_recorded', 'assessment_revised'] as const

export const factCheckAnalyticsRepository = {
  // Current state of every claim, grouped by workflow and assessment. Not limited to the range.
  claimSnapshot(now: Date): Promise<ClaimSnapshotRow[]> {
    return Claim.aggregate<ClaimSnapshotRow>([
      {
        $group: {
          _id: { workflowStatus: '$workflowStatus', assessmentStatus: '$assessmentStatus' },
          count: { $sum: 1 },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$workflowStatus', 'completed'] }, { $ne: ['$dueAt', null] }, { $lt: ['$dueAt', now] }] },
                1,
                0,
              ],
            },
          },
          unassigned: {
            $sum: { $cond: [{ $and: [{ $ne: ['$workflowStatus', 'completed'] }, { $eq: ['$assignee', null] }] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          workflowStatus: '$_id.workflowStatus',
          assessmentStatus: '$_id.assessmentStatus',
          count: 1,
          overdue: 1,
          unassigned: 1,
        },
      },
    ])
  },

  // Verdicts recorded in the range, counted per decision. A claim revised twice counts twice.
  verdictDecisions(range: DateRange): Promise<Array<{ verdict: string; count: number }>> {
    return ClaimEvent.aggregate<{ verdict: string; count: number }>([
      { $match: { action: { $in: assessmentActions }, createdAt: { $gte: range.start, $lt: range.end } } },
      { $group: { _id: '$toAssessment', count: { $sum: 1 } } },
      { $project: { _id: 0, verdict: '$_id', count: 1 } },
    ])
  },

  // Claims whose first verdict was recorded in the range, with hours from claim creation to that verdict.
  firstVerdictTurnaround(range: DateRange): Promise<{ count: number; totalHours: number }> {
    return ClaimEvent.aggregate<{ count: number; totalHours: number }>([
      { $match: { action: 'assessment_recorded' } },
      { $group: { _id: '$claim', firstAt: { $min: '$createdAt' } } },
      { $match: { firstAt: { $gte: range.start, $lt: range.end } } },
      { $lookup: { from: Claim.collection.name, localField: '_id', foreignField: '_id', as: 'claim' } },
      { $unwind: '$claim' },
      { $project: { hours: { $divide: [{ $subtract: ['$firstAt', '$claim.createdAt'] }, 3600000] } } },
      { $match: { hours: { $gte: 0 } } },
      { $group: { _id: null, count: { $sum: 1 }, totalHours: { $sum: '$hours' } } },
      { $project: { _id: 0, count: 1, totalHours: 1 } },
    ]).then((rows) => rows[0] ?? { count: 0, totalHours: 0 })
  },

  // Escalations opened in the range.
  countEscalations(range: DateRange): Promise<number> {
    return ClaimEvent.countDocuments({ action: 'escalated', createdAt: { $gte: range.start, $lt: range.end } })
  },

  // Verdict events per UTC day, to show verification completion over time.
  dailyVerdicts(range: DateRange): Promise<Array<{ day: string; verdicts: number }>> {
    return ClaimEvent.aggregate<{ day: string; verdicts: number }>([
      { $match: { action: { $in: assessmentActions }, createdAt: { $gte: range.start, $lt: range.end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
          verdicts: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: '$_id', verdicts: 1 } },
    ])
  },

  // Fact-check requests created in the range, by status.
  requestStatusCounts(range: DateRange): Promise<Array<{ status: string; count: number }>> {
    return FactCheckRequest.aggregate<{ status: string; count: number }>([
      { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ])
  },

  // Requests reviewed in the range, with hours from request to review.
  requestReviewTurnaround(range: DateRange): Promise<{ count: number; totalHours: number }> {
    return FactCheckRequest.aggregate<{ count: number; totalHours: number }>([
      { $match: { reviewedAt: { $gte: range.start, $lt: range.end } } },
      { $project: { hours: { $divide: [{ $subtract: ['$reviewedAt', '$createdAt'] }, 3600000] } } },
      { $match: { hours: { $gte: 0 } } },
      { $group: { _id: null, count: { $sum: 1 }, totalHours: { $sum: '$hours' } } },
      { $project: { _id: 0, count: 1, totalHours: 1 } },
    ]).then((rows) => rows[0] ?? { count: 0, totalHours: 0 })
  },
}
