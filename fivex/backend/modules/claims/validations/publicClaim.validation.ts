import { z } from 'zod'
import { CONCLUDING_ASSESSMENTS } from '../constants/claimStatus.js'

// A blank field (e.g. "?verdict=") means "no filter", not an invalid value.
const blankIsUndefined = (value: unknown) => (value === '' ? undefined : value)
const optional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blankIsUndefined, schema.optional())
const withDefault = <T extends z.ZodTypeAny>(schema: T, fallback: z.infer<T>) =>
  z.preprocess(blankIsUndefined, schema.default(fallback))

export const publicFactCheckListQuerySchema = z.object({
  verdict: optional(z.enum(CONCLUDING_ASSESSMENTS as [string, ...string[]])),
  q: optional(z.string().trim().max(100)),
  page: withDefault(z.coerce.number().int().min(1).max(10_000), 1),
  pageSize: withDefault(z.coerce.number().int().min(1).max(50), 12),
})

export type PublicFactCheckListQuery = z.infer<typeof publicFactCheckListQuerySchema>

export const publicClaimIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'That is not a valid fact-check id.')
// Article slugs are lowercase words and hyphens; anything else can't match one, so refuse it early.
export const publicSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(250)
  .regex(/^[a-z0-9-]+$/i, 'That is not a valid article address.')
