import { z } from 'zod'
import { CLAIM_STATUSES, EVIDENCE_STANCES, EVIDENCE_STATUSES, SOURCE_RELIABILITIES } from '../constants/claimStatus.js'

// Anything that becomes a link must be http(s). zod's .url() alone also accepts schemes like javascript:.
export const httpUrl = (message = 'Enter a valid web address (http or https).') =>
  z
    .string()
    .trim()
    .url(message)
    .refine((value) => /^https?:\/\//i.test(value), message)

const sourcesSchema = z.array(httpUrl('Each source must be a valid web address')).max(10, 'Add at most 10 sources')

export const createClaimSchema = z.object({
  articleId: z.string().min(1, 'An article is required'),
  text: z.string().trim().min(1, 'The claim is required').max(500, 'Claim is too long'),
})

export type CreateClaimInput = z.infer<typeof createClaimSchema>

export const updateClaimSchema = z
  .object({
    text: z.string().trim().min(1, 'The claim is required').max(500, 'Claim is too long'),
    status: z.enum(CLAIM_STATUSES),
    evidenceStatus: z.enum(EVIDENCE_STATUSES),
    evidenceSummary: z.string().trim().max(2000, 'Evidence summary is too long'),
    sources: sourcesSchema,
    // The reasoning behind a conclusion. Only meaningful alongside one.
    conclusion: z.string().trim().max(1000, 'Conclusion is too long'),
    reasoning: z.string().trim().max(4000, 'Reasoning is too long'),
    limitations: z.string().trim().max(2000, 'Limitations are too long'),
    uncertainty: z.string().trim().max(2000, 'Uncertainty is too long'),
  })
  .strict()
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' })

export type UpdateClaimInput = z.infer<typeof updateClaimSchema>

export const addEvidenceSchema = z
  .object({
    stance: z.enum(EVIDENCE_STANCES),
    title: z.string().trim().min(1, 'Give the evidence a title').max(200, 'Title is too long'),
    url: httpUrl().optional(),
    citation: z.string().trim().max(1000, 'Citation is too long').optional(),
    reliability: z.enum(SOURCE_RELIABILITIES).default('unknown'),
    reliabilityNote: z.string().trim().max(1000, 'Reliability note is too long').optional(),
  })
  .strict()
  .refine((data) => Boolean(data.url || data.citation), { message: 'Add a link or a citation', path: ['url'] })

export type AddEvidenceInput = z.infer<typeof addEvidenceSchema>

export const setArticleFactCheckSchema = z.object({
  factChecked: z.boolean(),
})

export type SetArticleFactCheckInput = z.infer<typeof setArticleFactCheckSchema>
