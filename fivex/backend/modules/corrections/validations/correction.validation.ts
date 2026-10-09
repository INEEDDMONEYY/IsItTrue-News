import { z } from 'zod'
import { CORRECTION_CATEGORIES, INVESTIGATION_VERDICTS } from '../constants/correctionStatus.js'

export const createCorrectionSchema = z.object({
  articleId: z.string().trim().regex(/^[a-f\d]{24}$/i, 'Choose a valid article'),
  category: z.enum(CORRECTION_CATEGORIES),
  description: z
    .string()
    .trim()
    .min(10, 'Describe what is wrong in at least 10 characters')
    .max(2000, 'Description is too long'),
  suggestedFix: z.string().trim().max(2000, 'Suggested fix is too long').optional(),
  evidenceLinks: z.array(z.string().trim().url('Evidence must be a valid link')).max(10).default([]),
})

export type CreateCorrectionInput = z.infer<typeof createCorrectionSchema>

export const recordFindingsSchema = z.object({
  findings: z.string().trim().min(1, 'Record what you found').max(4000, 'Findings are too long'),
  verdict: z.enum(INVESTIGATION_VERDICTS),
})

export type RecordFindingsInput = z.infer<typeof recordFindingsSchema>

export const publishCorrectionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(10, 'The correction notice must be at least 10 characters')
    .max(1000, 'The correction notice is too long'),
})

export type PublishCorrectionInput = z.infer<typeof publishCorrectionSchema>

export const dismissCorrectionSchema = z.object({
  reason: z.string().trim().min(1, 'Say why no correction is needed').max(500, 'Reason is too long'),
})

export type DismissCorrectionInput = z.infer<typeof dismissCorrectionSchema>
