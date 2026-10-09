import { z } from 'zod'
import { CLAIM_STATUSES, EVIDENCE_STATUSES } from '../constants/claimStatus.js'

const sourcesSchema = z.array(z.string().trim().url('Each source must be a valid URL')).max(10, 'Add at most 10 sources')

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
  })
  .strict()
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' })

export type UpdateClaimInput = z.infer<typeof updateClaimSchema>

export const setArticleFactCheckSchema = z.object({
  factChecked: z.boolean(),
})

export type SetArticleFactCheckInput = z.infer<typeof setArticleFactCheckSchema>
