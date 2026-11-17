import { editorialAnalyticsService } from './editorialAnalytics.service.js'
import { AppError } from '../../../shared/errors/AppError.js'
import type { ReportDataset } from '../validations/editorialAnalytics.validation.js'

type Row = Record<string, unknown>
type ReportPayload = Record<string, unknown> & { range: { from: string; to: string } }

interface ReportTable {
  columns: string[]
  rows: (payload: ReportPayload) => Row[]
}

interface ReportQuery {
  dataset: ReportDataset
  format: 'json' | 'csv'
  from?: string
  to?: string
  limit: number
}

// Each dataset is fetched through the same service method as its on-screen endpoint, so exports cannot differ from the dashboard.
const datasets: Record<ReportDataset, (query: ReportQuery) => Promise<ReportPayload>> = {
  overview: (query) => editorialAnalyticsService.getOverview(query) as Promise<ReportPayload>,
  authors: (query) => editorialAnalyticsService.getAuthorPerformance(query) as Promise<ReportPayload>,
  'content-quality': (query) => editorialAnalyticsService.getContentQuality(query) as Promise<ReportPayload>,
  workflow: (query) => editorialAnalyticsService.getWorkflow(query) as Promise<ReportPayload>,
  'fact-checks': (query) => editorialAnalyticsService.getFactChecks(query) as Promise<ReportPayload>,
  investigations: (query) => editorialAnalyticsService.getInvestigations(query) as Promise<ReportPayload>,
  'article-performance': (query) => editorialAnalyticsService.getArticlePerformance(query) as Promise<ReportPayload>,
}

const tables: Record<ReportDataset, ReportTable> = {
  overview: {
    columns: ['metric', 'value'],
    rows: (payload) => Object.entries(payload.overview as Row).map(([metric, value]) => ({ metric, value })),
  },
  authors: {
    columns: ['authorId', 'authorName', 'submitted', 'published', 'turnaroundSampleSize', 'averageTurnaroundHours'],
    rows: (payload) => payload.authors as Row[],
  },
  'content-quality': {
    columns: ['metric', 'value'],
    rows: (payload) => Object.entries(payload.quality as Row).map(([metric, value]) => ({ metric, value })),
  },
  workflow: {
    columns: ['stage', 'open', 'overdue', 'averageHoursSinceSubmission'],
    rows: (payload) => payload.stages as Row[],
  },
  'fact-checks': {
    columns: ['verdict', 'count', 'share'],
    rows: (payload) => ((payload.verdicts as { byVerdict: Row[] }).byVerdict),
  },
  investigations: {
    columns: ['stage', 'open', 'overdue'],
    rows: (payload) => payload.stages as Row[],
  },
  'article-performance': {
    columns: ['articleId', 'title', 'slug', 'category', 'publishedAt', 'views', 'uniqueVisitors', 'averageReadingSeconds'],
    rows: (payload) => payload.topArticles as Row[],
  },
}

// Quotes a value for CSV. Text starting with a formula character is prefixed so spreadsheets do not evaluate it.
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let text = value instanceof Date ? value.toISOString() : String(value)
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(columns: string[], rows: Row[]): string {
  const lines = [columns.map(csvCell).join(',')]
  for (const row of rows) lines.push(columns.map((column) => csvCell(row[column])).join(','))
  return `${lines.join('\r\n')}\r\n`
}

export const editorialReportsService = {
  async getReport(query: ReportQuery, now: Date = new Date()) {
    const payload = await datasets[query.dataset](query)
    if (!payload) throw new AppError('Report could not be generated.', 500)

    if (query.format === 'json') {
      return { format: 'json' as const, body: { dataset: query.dataset, ...payload, generatedAt: now.toISOString() } }
    }

    const table = tables[query.dataset]
    return {
      format: 'csv' as const,
      filename: `editorial-${query.dataset}-${payload.range.from}-to-${payload.range.to}.csv`,
      body: toCsv(table.columns, table.rows(payload)),
    }
  },
}
