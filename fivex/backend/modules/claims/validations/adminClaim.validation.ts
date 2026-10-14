import { z } from 'zod'
import {
  ASSESSMENT_STATUSES,
  CLAIM_PRIORITIES,
  CONCLUDING_ASSESSMENTS,
  ESCALATION_KINDS,
  EVIDENCE_STATES,
  FACT_CHECK_VIEWS,
  WORKFLOW_STATUSES,
} from '../constants/claimStatus.js'

export const ADMIN_CLAIM_SORT_FIELDS = ['updatedAt', 'createdAt', 'priority', 'dueAt'] as const

const OBJECT_ID = /^[a-f\d]{24}$/i
export const adminClaimIdSchema = z.string().regex(OBJECT_ID, 'That is not a valid id.')

// A blank field (e.g. "?priority=") means "no filter", not an invalid value.
const blankIsUndefined = (value: unknown) => (value === '' ? undefined : value)
const optional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blankIsUndefined, schema.optional())
const withDefault = <T extends z.ZodTypeAny>(schema: T, fallback: z.infer<T>) =>
  z.preprocess(blankIsUndefined, schema.default(fallback))

export const adminClaimListQuerySchema = z.object({
  view: withDefault(z.enum(FACT_CHECK_VIEWS), 'all'),
  q: optional(z.string().trim().max(100)),
  workflow: optional(z.enum(WORKFLOW_STATUSES)),
  assessment: optional(z.enum(ASSESSMENT_STATUSES)),
  evidence: optional(z.enum(EVIDENCE_STATES)),
  priority: optional(z.enum(CLAIM_PRIORITIES)),
  assignee: optional(z.union([z.literal('unassigned'), z.string().regex(OBJECT_ID, 'assignee must be an id or "unassigned".')])),
  sort: withDefault(z.enum(ADMIN_CLAIM_SORT_FIELDS), 'updatedAt'),
  order: withDefault(z.enum(['asc', 'desc']), 'desc'),
  page: withDefault(z.coerce.number().int().min(1).max(10_000), 1),
  pageSize: withDefault(z.coerce.number().int().min(1).max(100), 20),
})

export type AdminClaimListQuery = z.infer<typeof adminClaimListQuerySchema>

// Consequential actions always carry a reason, so the history can say why.
const reason = (max: number, what = 'a reason') =>
  z.string().trim().min(1, `Give ${what}.`).max(max, `Keep it under ${max} characters.`)
const optionalNote = z.string().trim().max(1000, 'Keep the note under 1000 characters.').optional()

export const assignSchema = z.object({ reviewerId: adminClaimIdSchema, note: optionalNote }).strict()
export const unassignSchema = z.object({ reason: reason(500) }).strict()
export const returnSchema = z.object({ reason: reason(2000, 'a reason the reviewer will see') }).strict()
export const escalateSchema = z
  .object({ kind: z.enum(ESCALATION_KINDS), reason: reason(2000, 'the reason for escalating') })
  .strict()
export const resolveEscalationSchema = z.object({ note: reason(2000, 'a note on how this was resolved') }).strict()
export const flagEvidenceSchema = z.object({ reason: reason(1000, 'what is missing or incomplete') }).strict()
export const clearFlagSchema = z.object({ note: optionalNote }).strict()
export const restrictionSchema = z
  .object({ restricted: z.boolean(), reason: reason(500) })
  .strict()
export const commentSchema = z.object({ note: reason(2000, 'a comment') }).strict()
export const investigationLinkSchema = z
  .object({ investigationId: adminClaimIdSchema.nullable(), note: optionalNote })
  .strict()

// Changing a recorded conclusion is allowed, but never silently: it needs a reason, and the previous
// assessment is kept in the history.
export const revisionSchema = z
  .object({
    assessmentStatus: z.enum(CONCLUDING_ASSESSMENTS as [string, ...string[]]),
    conclusion: z.string().trim().max(1000).optional(),
    reasoning: z.string().trim().max(4000).optional(),
    limitations: z.string().trim().max(2000).optional(),
    uncertainty: z.string().trim().max(2000).optional(),
    reason: reason(1000, 'why this conclusion is being changed'),
  })
  .strict()

export const metadataSchema = z
  .object({
    priority: z.enum(CLAIM_PRIORITIES).optional(),
    // A calendar day, or null to remove the deadline.
    dueAt: z.string().date('Use a date like 2026-03-31.').nullable().optional(),
    context: z.string().trim().max(1000).optional(),
    checkReason: z.string().trim().max(500).optional(),
    note: optionalNote,
  })
  .strict()
  .refine(
    (body) => ['priority', 'dueAt', 'context', 'checkReason'].some((key) => (body as Record<string, unknown>)[key] !== undefined),
    { message: 'Nothing to change.' },
  )

export type AssignInput = z.infer<typeof assignSchema>
export type UnassignInput = z.infer<typeof unassignSchema>
export type ReturnInput = z.infer<typeof returnSchema>
export type EscalateInput = z.infer<typeof escalateSchema>
export type ResolveEscalationInput = z.infer<typeof resolveEscalationSchema>
export type FlagEvidenceInput = z.infer<typeof flagEvidenceSchema>
export type ClearFlagInput = z.infer<typeof clearFlagSchema>
export type RestrictionInput = z.infer<typeof restrictionSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type InvestigationLinkInput = z.infer<typeof investigationLinkSchema>
export type RevisionInput = z.infer<typeof revisionSchema>
export type MetadataInput = z.infer<typeof metadataSchema>
