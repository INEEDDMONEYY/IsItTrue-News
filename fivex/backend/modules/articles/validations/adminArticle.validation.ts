import { z } from 'zod'
import { ALL_ARTICLE_STATUSES, ARTICLE_STATUSES } from '../constants/articleStatus.js'
import { FACT_CHECK_STATUSES } from '../models/Article.js'

export const ADMIN_ARTICLE_SORT_FIELDS = ['createdAt', 'updatedAt', 'views', 'title'] as const

export const MAX_STATUS_NOTE_LENGTH = 500

// A blank field (e.g. "?status=") means "no filter", not an invalid value.
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional())

export const adminArticleIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'That is not a valid article id.')

export const adminArticleListQuerySchema = z
  .object({
    q: optional(z.string().trim().max(100)),
    status: optional(z.enum(ALL_ARTICLE_STATUSES as [string, ...string[]])),
    category: optional(z.string().trim().max(100)),
    factCheckStatus: optional(z.enum(FACT_CHECK_STATUSES)),
    from: optional(z.string().date('"from" must be a date like 2026-01-31.')),
    to: optional(z.string().date('"to" must be a date like 2026-01-31.')),
    sort: z.preprocess((v) => (v === '' ? undefined : v), z.enum(ADMIN_ARTICLE_SORT_FIELDS).default('createdAt')),
    order: z.preprocess((v) => (v === '' ? undefined : v), z.enum(['asc', 'desc']).default('desc')),
    page: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().min(1).max(10_000).default(1)),
    pageSize: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().min(1).max(100).default(20)),
  })
  .refine((query) => !query.from || !query.to || query.from <= query.to, {
    message: '"from" must not be after "to".',
    path: ['from'],
  })

export type AdminArticleListQuery = z.infer<typeof adminArticleListQuerySchema>

// Sending an article back to draft always needs a reason, because the author is shown it.
export const adminArticleStatusSchema = z
  .object({
    status: z.enum(ALL_ARTICLE_STATUSES as [string, ...string[]]),
    note: z.string().trim().max(MAX_STATUS_NOTE_LENGTH, `Keep the note under ${MAX_STATUS_NOTE_LENGTH} characters.`).optional(),
  })
  .refine((body) => body.status !== ARTICLE_STATUSES.DRAFT || Boolean(body.note), {
    message: 'Add a note explaining why this is going back to draft. The author will see it.',
    path: ['note'],
  })

export type AdminArticleStatusInput = z.infer<typeof adminArticleStatusSchema>
