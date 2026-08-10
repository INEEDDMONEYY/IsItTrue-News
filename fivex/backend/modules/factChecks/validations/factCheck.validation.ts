import { z } from 'zod'

export const createFactCheckRequestSchema = z.object({
  articleId: z.string().min(1, 'An article is required'),
  claim: z.string().trim().min(1, 'Claim is required').max(500, 'Claim is too long'),
  sources: z.string().trim().min(1, 'Sources are required').max(2000, 'Sources are too long'),
  notes: z.string().trim().min(1, 'Summary is required').max(2000, 'Summary is too long'),
})

export type CreateFactCheckRequestInput = z.infer<typeof createFactCheckRequestSchema>

export const rejectFactCheckRequestSchema = z.object({
  reason: z.string().trim().min(1, 'A rejection reason is required').max(500, 'Reason is too long'),
})

export type RejectFactCheckRequestInput = z.infer<typeof rejectFactCheckRequestSchema>
