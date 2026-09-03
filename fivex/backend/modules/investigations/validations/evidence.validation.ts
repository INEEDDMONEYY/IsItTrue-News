import { z } from 'zod'
import { EVIDENCE_KINDS } from '../models/Evidence.js'

export const createEvidenceSchema = z.object({
  kind: z.enum(EVIDENCE_KINDS),
  title: z.string().trim().min(1, 'A title is required').max(200),
  description: z.string().trim().max(1000).optional(),
  url: z.string().trim().max(1000).optional(),
  thumbnailUrl: z.string().trim().max(1000).optional(),
  source: z.string().trim().max(300).optional(),
})

export type CreateEvidenceInput = z.infer<typeof createEvidenceSchema>

export const updateEvidenceSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  source: z.string().trim().max(300).optional(),
})

export type UpdateEvidenceInput = z.infer<typeof updateEvidenceSchema>
