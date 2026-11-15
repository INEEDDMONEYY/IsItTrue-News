import { z } from 'zod'
import { AUDIT_CATEGORIES, AUDIT_OUTCOMES, AUDIT_SEVERITIES } from '../constants/auditCatalog.js'

const blankIsUndefined = (value: unknown) => (value === '' || value === 'all' ? undefined : value)
const optional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blankIsUndefined, schema.optional())
const withDefault = <T extends z.ZodTypeAny>(schema: T, fallback: z.infer<T>) =>
  z.preprocess(blankIsUndefined, schema.default(fallback))

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a YYYY-MM-DD date')
  .transform((value) => new Date(`${value}T00:00:00.000Z`))
  .refine((date) => !Number.isNaN(date.getTime()), 'Invalid date')

export const auditLogListQuerySchema = z.object({
  search: optional(z.string().trim().max(100)),
  category: optional(z.enum(AUDIT_CATEGORIES)),
  severity: optional(z.enum(AUDIT_SEVERITIES)),
  outcome: optional(z.enum(AUDIT_OUTCOMES)),
  actorId: optional(z.string().trim().max(64)),
  // Start is inclusive. End is given as a day and made inclusive by querying up to the next day.
  startDate: optional(dateOnly),
  endDate: optional(dateOnly.transform((date) => new Date(date.getTime() + 24 * 60 * 60 * 1000))),
  sortOrder: withDefault(z.enum(['newest', 'oldest']), 'newest'),
  page: withDefault(z.coerce.number().int().min(1), 1),
  pageSize: withDefault(z.coerce.number().int().min(1).max(100), 25),
})

export type AuditLogListQuery = z.infer<typeof auditLogListQuerySchema>
