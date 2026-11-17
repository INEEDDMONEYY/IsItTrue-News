import { ARTICLE_EDITORIAL_STAGES } from '../../articles/constants/editorialWorkflow.js'
import { ASSESSMENT_STATUSES, WORKFLOW_STATUSES } from '../../claims/constants/claimStatus.js'
import { INVESTIGATION_WORKFLOW_STAGES } from '../../investigations/constants/editorialWorkflow.js'
import { editorialAnalyticsRepository } from '../repositories/editorialAnalytics.repository.js'
import { workflowAnalyticsRepository } from '../repositories/workflowAnalytics.repository.js'
import { factCheckAnalyticsRepository } from '../repositories/factCheckAnalytics.repository.js'
import { investigationAnalyticsRepository } from '../repositories/investigationAnalytics.repository.js'
import { articlePerformanceRepository } from '../repositories/articlePerformance.repository.js'
import { resolveDateRange, type DateRange } from '../validations/editorialAnalytics.validation.js'

const HOUR_MS = 60 * 60 * 1000
const INVESTIGATION_OPEN_STATUSES = ['draft', 'pending_review'] as const
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)
const hoursOrNull = (totalMs: number, count: number) => {
  const averageMs = average(totalMs, count)
  return averageMs === null ? null : roundTo(averageMs / HOUR_MS)
}

// A rate or average is null when its denominator is zero. Callers must show that as "no data", never as 0%.
export function ratio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null
}

export function average(total: number, count: number): number | null {
  return count > 0 ? total / count : null
}

export function roundTo(value: number | null, digits = 1): number | null {
  if (value === null) return null
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

async function buildOverview(range: DateRange, now: Date) {
  const [submitted, publishedFromSubmissions, returned, pending, activeAuthors, turnaround, views, uniqueVisitors] =
    await Promise.all([
      editorialAnalyticsRepository.countSubmitted(range),
      editorialAnalyticsRepository.countPublishedFromSubmissions(range),
      editorialAnalyticsRepository.countReturned(range),
      editorialAnalyticsRepository.countPendingReviews(now),
      editorialAnalyticsRepository.distinctActiveAuthors(range),
      editorialAnalyticsRepository.turnaroundStats(range),
      editorialAnalyticsRepository.viewTotals(range),
      editorialAnalyticsRepository.uniqueVisitors(range),
    ])

  return {
    articlesSubmitted: submitted,
    articlesPublishedFromSubmissions: publishedFromSubmissions,
    articlesReturned: returned,
    returnRate: roundTo(ratio(returned, submitted), 3),
    pendingReviews: pending.pending,
    overdueReviews: pending.overdue,
    activeAuthors,
    averageTurnaroundHours: roundTo(average(turnaround.totalHours, turnaround.count)),
    turnaroundSampleSize: turnaround.count,
    articleViews: views.views,
    uniqueVisitors,
    averageReadingSeconds: roundTo(average(views.readingSeconds, views.readingCount)),
    readingSampleSize: views.readingCount,
  }
}

export const editorialAnalyticsService = {
  async getOverview(query: { from?: string; to?: string }, now: Date = new Date()) {
    const range = resolveDateRange(query, now)
    const [overview, dailySubmissions, dailyViews, referrers] = await Promise.all([
      buildOverview(range, now),
      editorialAnalyticsRepository.dailySubmissions(range),
      editorialAnalyticsRepository.dailyViews(range),
      editorialAnalyticsRepository.topReferrers(range, 10),
    ])
    return {
      range: { from: range.from, to: range.to, timezone: 'UTC' },
      overview,
      trends: { submissionsByDay: dailySubmissions, viewsByDay: dailyViews },
      referrers,
      generatedAt: now.toISOString(),
    }
  },

  async getContentQuality(query: { from?: string; to?: string }, now: Date = new Date()) {
    const range = resolveDateRange(query, now)
    const [decisions, revisions, publishedCount, correctionsReported, byCategory, byStatus, dailyCorrections] =
      await Promise.all([
        editorialAnalyticsRepository.decisionCounts(range),
        editorialAnalyticsRepository.revisionFrequency(range),
        editorialAnalyticsRepository.countPublishedInRange(range),
        editorialAnalyticsRepository.countCorrectionsReported(range),
        editorialAnalyticsRepository.correctionBreakdown(range, 'category'),
        editorialAnalyticsRepository.correctionBreakdown(range, 'status'),
        editorialAnalyticsRepository.dailyCorrections(range),
      ])

    const decisionTotal = decisions.approved + decisions.changesRequested
    return {
      range: { from: range.from, to: range.to, timezone: 'UTC' },
      quality: {
        // Share of editor decisions that sent an article back for revision.
        returnForRevisionRate: roundTo(ratio(decisions.changesRequested, decisionTotal), 3),
        decisionSampleSize: decisionTotal,
        approvedDecisions: decisions.approved,
        changesRequestedDecisions: decisions.changesRequested,
        // Share of reviewed articles that were returned at least once.
        articlesReviewed: revisions.reviewed,
        articlesReturnedOnce: revisions.returnedOnce,
        articlesReturnedRepeatedly: revisions.returnedRepeatedly,
        repeatReturnRate: roundTo(ratio(revisions.returnedRepeatedly, revisions.reviewed), 3),
        // Corrections reported per article published in the same range. Null when nothing was published.
        publishedArticles: publishedCount,
        correctionsReported: correctionsReported,
        correctionRate: roundTo(ratio(correctionsReported, publishedCount), 3),
      },
      correctionsByCategory: byCategory,
      correctionsByStatus: byStatus,
      trends: { correctionsByDay: dailyCorrections },
      generatedAt: now.toISOString(),
    }
  },

  async getAuthorPerformance(query: { from?: string; to?: string; limit: number }, now: Date = new Date()) {
    const range = resolveDateRange(query, now)
    const rows = await editorialAnalyticsRepository.authorPerformance(range, query.limit)
    return {
      range: { from: range.from, to: range.to, timezone: 'UTC' },
      authors: rows.map((row) => ({
        authorId: String(row.authorId),
        authorName: row.authorName,
        submitted: row.submitted,
        published: row.published,
        turnaroundSampleSize: row.turnaroundCount,
        averageTurnaroundHours: roundTo(average(row.turnaroundHours, row.turnaroundCount)),
      })),
      generatedAt: now.toISOString(),
    }
  },

  async getWorkflow(query: { from?: string; to?: string; limit: number }, now: Date = new Date()) {
    const range = resolveDateRange(query, now)
    const [snapshot, pending, turnaround, dailyReturns, recent] = await Promise.all([
      workflowAnalyticsRepository.stageSnapshot(now),
      editorialAnalyticsRepository.countPendingReviews(now),
      editorialAnalyticsRepository.turnaroundStats(range),
      workflowAnalyticsRepository.dailyReturns(range),
      workflowAnalyticsRepository.recentDecisions(range, query.limit),
    ])

    const stages: Array<{
      stage: string
      open: number
      overdue: number
      averageHoursSinceSubmission: number | null
    }> = ARTICLE_EDITORIAL_STAGES.map((stage) => {
      const row = snapshot.find((item) => item.stage === stage)
      return {
        stage,
        open: row?.open ?? 0,
        overdue: row?.overdue ?? 0,
        averageHoursSinceSubmission: hoursOrNull(row?.msSinceSubmission ?? 0, row?.submitted ?? 0),
      }
    })
    const unstaged = snapshot.find((item) => item.stage === null || item.stage === undefined)
    if (unstaged) {
      stages.push({
        stage: 'unstaged',
        open: unstaged.open,
        overdue: unstaged.overdue,
        averageHoursSinceSubmission: hoursOrNull(unstaged.msSinceSubmission, unstaged.submitted),
      })
    }

    return {
      range: { from: range.from, to: range.to, timezone: 'UTC' },
      totals: {
        openArticles: sum(stages.map((stage) => stage.open)),
        overdueArticles: sum(stages.map((stage) => stage.overdue)),
        pendingReviews: pending.pending,
        overdueReviews: pending.overdue,
      },
      stages,
      turnaround: {
        averageHours: roundTo(average(turnaround.totalHours, turnaround.count)),
        sampleSize: turnaround.count,
      },
      trends: { returnsByDay: dailyReturns },
      recentDecisions: recent.map((row) => ({
        articleId: String(row.article),
        articleTitle: row.articleTitle,
        decision: row.action,
        actorRole: row.actorRole,
        createdAt: row.createdAt.toISOString(),
      })),
      // Metrics the application does not record yet. They are reported as missing rather than estimated.
      unavailable: [
        {
          metric: 'article-assignment-completion',
          reason: 'Articles do not record a reviewer assignment, so assignment completion cannot be measured.',
        },
        {
          metric: 'time-in-stage',
          reason: 'Only the submission time is recorded per article, so time spent in each stage is not available.',
        },
      ],
      generatedAt: now.toISOString(),
    }
  },

  async getFactChecks(query: { from?: string; to?: string }, now: Date = new Date()) {
    const range = resolveDateRange(query, now)
    const [snapshot, verdicts, escalations, firstVerdict, dailyVerdicts, requestStatuses, requestTurnaround] =
      await Promise.all([
        factCheckAnalyticsRepository.claimSnapshot(now),
        factCheckAnalyticsRepository.verdictDecisions(range),
        factCheckAnalyticsRepository.countEscalations(range),
        factCheckAnalyticsRepository.firstVerdictTurnaround(range),
        factCheckAnalyticsRepository.dailyVerdicts(range),
        factCheckAnalyticsRepository.requestStatusCounts(range),
        factCheckAnalyticsRepository.requestReviewTurnaround(range),
      ])

    const isOpen = (row: { workflowStatus: string }) => row.workflowStatus !== 'completed'
    const verdictCount = (verdict: string) => verdicts.find((row) => row.verdict === verdict)?.count ?? 0
    const verdictTotal = sum(verdicts.map((row) => row.count))
    const totalClaims = sum(snapshot.map((row) => row.count))
    const openClaims = sum(snapshot.filter(isOpen).map((row) => row.count))

    return {
      range: { from: range.from, to: range.to, timezone: 'UTC' },
      totals: {
        claims: totalClaims,
        openClaims,
        completedClaims: totalClaims - openClaims,
        overdueClaims: sum(snapshot.map((row) => row.overdue)),
        unassignedOpenClaims: sum(snapshot.map((row) => row.unassigned)),
      },
      // Current workload, counted in aggregate only. No per-reviewer ranking is produced.
      workflow: WORKFLOW_STATUSES.map((status) => ({
        status,
        count: sum(snapshot.filter((row) => row.workflowStatus === status).map((row) => row.count)),
      })),
      assessments: ASSESSMENT_STATUSES.map((status) => ({
        status,
        count: sum(snapshot.filter((row) => row.assessmentStatus === status).map((row) => row.count)),
      })),
      verdicts: {
        // Verdicts recorded or revised in the range. A revised claim counts once per decision.
        decisions: verdictTotal,
        byVerdict: ASSESSMENT_STATUSES.filter((status) => status !== 'none').map((status) => ({
          verdict: status,
          count: verdictCount(status),
          share: roundTo(ratio(verdictCount(status), verdictTotal), 3),
        })),
        disputedDecisions: verdictCount('disputed'),
        escalationsOpened: escalations,
      },
      turnaround: {
        // Hours from claim creation to its first verdict, for claims first verdicted in the range.
        averageHoursToFirstVerdict: roundTo(average(firstVerdict.totalHours, firstVerdict.count)),
        sampleSize: firstVerdict.count,
      },
      requests: {
        byStatus: requestStatuses,
        averageHoursToReview: roundTo(average(requestTurnaround.totalHours, requestTurnaround.count)),
        reviewSampleSize: requestTurnaround.count,
      },
      trends: { verdictsByDay: dailyVerdicts },
      generatedAt: now.toISOString(),
    }
  },

  async getInvestigations(query: { from?: string; to?: string; limit: number }, now: Date = new Date()) {
    const range = resolveDateRange(query, now)
    const [snapshot, completion, evidence, dailyEvidence, openByAuthor] = await Promise.all([
      investigationAnalyticsRepository.snapshot(now),
      investigationAnalyticsRepository.completionTime(range),
      investigationAnalyticsRepository.evidenceBreakdown(range),
      investigationAnalyticsRepository.dailyEvidence(range),
      investigationAnalyticsRepository.openByAuthor(query.limit),
    ])

    const isOpen = (status: string) => (INVESTIGATION_OPEN_STATUSES as readonly string[]).includes(status)
    const openCount = sum(snapshot.filter((row) => isOpen(row.status)).map((row) => row.count))
    const kinds = [...new Set(evidence.map((row) => row.kind))].sort()

    return {
      range: { from: range.from, to: range.to, timezone: 'UTC' },
      totals: {
        investigations: sum(snapshot.map((row) => row.count)),
        openInvestigations: openCount,
        awaitingEditorialReview: sum(snapshot.filter((row) => row.status === 'pending_review').map((row) => row.count)),
        overdueInvestigations: sum(snapshot.map((row) => row.overdue)),
        publishedInRange: completion.count,
      },
      stages: INVESTIGATION_WORKFLOW_STAGES.map((stage) => ({
        stage,
        open: sum(snapshot.filter((row) => row.workflowStage === stage && isOpen(row.status)).map((row) => row.count)),
        overdue: sum(snapshot.filter((row) => row.workflowStage === stage).map((row) => row.overdue)),
      })),
      completion: {
        averageHoursToPublication: roundTo(average(completion.totalHours, completion.count)),
        sampleSize: completion.count,
      },
      evidence: {
        total: sum(evidence.map((row) => row.count)),
        byKind: kinds.map((kind) => ({
          kind,
          count: sum(evidence.filter((row) => row.kind === kind).map((row) => row.count)),
        })),
        byVisibility: ['private', 'public'].map((visibility) => ({
          visibility,
          count: sum(evidence.filter((row) => row.visibility === visibility).map((row) => row.count)),
        })),
      },
      workload: openByAuthor,
      trends: { evidenceByDay: dailyEvidence },
      generatedAt: now.toISOString(),
    }
  },

  async getArticlePerformance(query: { from?: string; to?: string; limit: number }, now: Date = new Date()) {
    const range = resolveDateRange(query, now)
    const [totals, top, byCategory, byMonth, referrers, dailyViews] = await Promise.all([
      articlePerformanceRepository.totals(range),
      articlePerformanceRepository.topArticles(range, query.limit),
      articlePerformanceRepository.byCategory(range),
      articlePerformanceRepository.byPublicationMonth(range),
      editorialAnalyticsRepository.topReferrers(range, 10),
      editorialAnalyticsRepository.dailyViews(range),
    ])

    const withReading = <T extends { readingSeconds: number; readingSamples: number }>(row: T) => ({
      ...row,
      averageReadingSeconds: roundTo(average(row.readingSeconds, row.readingSamples)),
    })

    return {
      range: { from: range.from, to: range.to, timezone: 'UTC' },
      totals: {
        views: totals.views,
        uniqueVisitors: totals.uniqueVisitors,
        averageReadingSeconds: roundTo(average(totals.readingSeconds, totals.readingSamples)),
        readingSampleSize: totals.readingSamples,
      },
      topArticles: top.map(withReading),
      byCategory: byCategory.map(withReading),
      byPublicationMonth: byMonth.map(withReading),
      referrers,
      trends: { viewsByDay: dailyViews },
      notes: [
        'Unique visitors are counted per day because the visitor identifier rotates daily, so one visitor across several days is counted once per day.',
        'Per-category and per-month rows do not include unique visitors, because they cannot be summed across articles.',
      ],
      unavailable: [
        { metric: 'engagement', reason: 'Scroll depth and interaction events are not collected.' },
      ],
      generatedAt: now.toISOString(),
    }
  },
}
