export interface EditorialAnalyticsRange {
  from: string
  to: string
  timezone: 'UTC'
}

// Rates and averages are null when their denominator is zero. Show them as "No data", never as 0.
export interface EditorialOverviewMetrics {
  articlesSubmitted: number
  articlesPublishedFromSubmissions: number
  articlesReturned: number
  returnRate: number | null
  pendingReviews: number
  overdueReviews: number
  activeAuthors: number
  averageTurnaroundHours: number | null
  turnaroundSampleSize: number
  articleViews: number
  uniqueVisitors: number
  averageReadingSeconds: number | null
  readingSampleSize: number
}

export interface EditorialOverviewResponse {
  range: EditorialAnalyticsRange
  overview: EditorialOverviewMetrics
  trends: {
    submissionsByDay: Array<{ day: string; submitted: number }>
    viewsByDay: Array<{ day: string; views: number; visitors: number }>
  }
  referrers: Array<{ host: string; views: number }>
  generatedAt: string
}

export interface AuthorPerformanceRow {
  authorId: string
  authorName: string | null
  submitted: number
  published: number
  turnaroundSampleSize: number
  averageTurnaroundHours: number | null
}

export interface AuthorPerformanceResponse {
  range: EditorialAnalyticsRange
  authors: AuthorPerformanceRow[]
  generatedAt: string
}

export interface EditorialAnalyticsQuery {
  from?: string
  to?: string
  limit?: number
}

export interface ContentQualityMetrics {
  returnForRevisionRate: number | null
  decisionSampleSize: number
  approvedDecisions: number
  changesRequestedDecisions: number
  articlesReviewed: number
  articlesReturnedOnce: number
  articlesReturnedRepeatedly: number
  repeatReturnRate: number | null
  publishedArticles: number
  correctionsReported: number
  correctionRate: number | null
}

export interface ContentQualityResponse {
  range: EditorialAnalyticsRange
  quality: ContentQualityMetrics
  correctionsByCategory: Array<{ key: string; count: number }>
  correctionsByStatus: Array<{ key: string; count: number }>
  trends: { correctionsByDay: Array<{ day: string; reported: number }> }
  generatedAt: string
}

// Every list is reported as-is from the backend. Missing metrics are listed in `unavailable`, never estimated.
export interface UnavailableMetric {
  metric: string
  reason: string
}

export interface WorkflowStageRow {
  stage: string
  open: number
  overdue: number
  averageHoursSinceSubmission: number | null
}

export interface WorkflowResponse {
  range: EditorialAnalyticsRange
  totals: {
    openArticles: number
    overdueArticles: number
    pendingReviews: number
    overdueReviews: number
  }
  stages: WorkflowStageRow[]
  turnaround: { averageHours: number | null; sampleSize: number }
  trends: { returnsByDay: Array<{ day: string; returned: number }> }
  recentDecisions: Array<{
    articleId: string
    articleTitle: string
    decision: string
    actorRole: string
    createdAt: string
  }>
  unavailable: UnavailableMetric[]
  generatedAt: string
}

export interface FactCheckResponse {
  range: EditorialAnalyticsRange
  totals: {
    claims: number
    openClaims: number
    completedClaims: number
    overdueClaims: number
    unassignedOpenClaims: number
  }
  workflow: Array<{ status: string; count: number }>
  assessments: Array<{ status: string; count: number }>
  verdicts: {
    decisions: number
    byVerdict: Array<{ verdict: string; count: number; share: number | null }>
    disputedDecisions: number
    escalationsOpened: number
  }
  turnaround: { averageHoursToFirstVerdict: number | null; sampleSize: number }
  requests: {
    byStatus: Array<{ status: string; count: number }>
    averageHoursToReview: number | null
    reviewSampleSize: number
  }
  trends: { verdictsByDay: Array<{ day: string; verdicts: number }> }
  generatedAt: string
}

export interface InvestigationResponse {
  range: EditorialAnalyticsRange
  totals: {
    investigations: number
    openInvestigations: number
    awaitingEditorialReview: number
    overdueInvestigations: number
    publishedInRange: number
  }
  stages: Array<{ stage: string; open: number; overdue: number }>
  completion: { averageHoursToPublication: number | null; sampleSize: number }
  evidence: {
    total: number
    byKind: Array<{ kind: string; count: number }>
    byVisibility: Array<{ visibility: string; count: number }>
  }
  workload: Array<{ authorId: string; authorName: string | null; open: number }>
  trends: { evidenceByDay: Array<{ day: string; evidence: number }> }
  generatedAt: string
}

export interface ArticleSliceRow {
  key: string
  articles: number
  views: number
  readingSeconds: number
  readingSamples: number
  averageReadingSeconds: number | null
}

export interface ArticlePerformanceRow {
  articleId: string
  title: string
  slug: string
  category: string | null
  publishedAt: string | null
  views: number
  uniqueVisitors: number
  readingSeconds: number
  readingSamples: number
  averageReadingSeconds: number | null
}

export interface ArticlePerformanceResponse {
  range: EditorialAnalyticsRange
  totals: {
    views: number
    uniqueVisitors: number
    averageReadingSeconds: number | null
    readingSampleSize: number
  }
  topArticles: ArticlePerformanceRow[]
  byCategory: ArticleSliceRow[]
  byPublicationMonth: ArticleSliceRow[]
  referrers: Array<{ host: string; views: number }>
  trends: { viewsByDay: Array<{ day: string; views: number; visitors: number }> }
  notes: string[]
  unavailable: UnavailableMetric[]
  generatedAt: string
}

export const REPORT_DATASET_OPTIONS = [
  { value: 'overview', label: 'Editorial activity' },
  { value: 'authors', label: 'Author performance' },
  { value: 'content-quality', label: 'Content quality' },
  { value: 'workflow', label: 'Editorial workflow' },
  { value: 'fact-checks', label: 'Fact-check analytics' },
  { value: 'investigations', label: 'Investigation analytics' },
  { value: 'article-performance', label: 'Article performance' },
] as const

export type ReportDataset = (typeof REPORT_DATASET_OPTIONS)[number]['value']
