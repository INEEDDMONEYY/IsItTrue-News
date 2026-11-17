import { z } from 'zod'

export const MAX_RANGE_DAYS = 366
const DAY_MS = 24 * 60 * 60 * 1000

const isoDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Dates must use the YYYY-MM-DD format.')
  .refine((value) => new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value, 'Date is not a real calendar day.')

export const REPORT_DATASETS = [
  'overview',
  'authors',
  'content-quality',
  'workflow',
  'fact-checks',
  'investigations',
  'article-performance',
] as const

export type ReportDataset = (typeof REPORT_DATASETS)[number]

const dateRangeQuery = z.object({
  from: isoDay.optional(),
  to: isoDay.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
})

function refineDateRange(query: { from?: string; to?: string }, ctx: z.RefinementCtx) {
  if (query.from && query.to && query.from > query.to) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: '"from" must be on or before "to".', path: ['from'] })
    return
  }
  if (query.from && query.to) {
    const span = (Date.parse(`${query.to}T00:00:00Z`) - Date.parse(`${query.from}T00:00:00Z`)) / DAY_MS + 1
    if (span > MAX_RANGE_DAYS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The date range can be at most ${MAX_RANGE_DAYS} days.`,
        path: ['to'],
      })
    }
  }
}

export const editorialAnalyticsQuerySchema = dateRangeQuery.superRefine(refineDateRange)

export const reportQuerySchema = dateRangeQuery
  .extend({
    dataset: z.enum(REPORT_DATASETS),
    format: z.enum(['json', 'csv']).default('json'),
  })
  .superRefine(refineDateRange)

export interface DateRange {
  from: string
  to: string
  start: Date
  end: Date
}

// Resolves the query to whole UTC days. "end" is exclusive, so the last day is included in full.
// Without explicit dates the range is the last 30 UTC days ending today.
export function resolveDateRange(query: { from?: string; to?: string }, now: Date = new Date()): DateRange {
  const today = now.toISOString().slice(0, 10)
  const to = query.to ?? today
  const from = query.from ?? new Date(Date.parse(`${to}T00:00:00Z`) - 29 * DAY_MS).toISOString().slice(0, 10)
  const start = new Date(`${from}T00:00:00.000Z`)
  const end = new Date(Date.parse(`${to}T00:00:00.000Z`) + DAY_MS)
  return { from, to, start, end }
}
