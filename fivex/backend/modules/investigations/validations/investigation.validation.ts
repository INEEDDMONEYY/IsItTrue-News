import { z } from 'zod'

export const createInvestigationSchema = z.object({
  title: z.string().trim().min(1, 'A title is required').max(200),
  subheadline: z.string().trim().max(300).optional(),
  summary: z.string().trim().min(1, 'A summary is required').max(800),
  coverImage: z.string().trim().max(500).optional(),
  category: z.string().trim().max(80).optional(),
  bodyHtml: z.string().max(50000).optional(),
})

export type CreateInvestigationInput = z.infer<typeof createInvestigationSchema>

export const updateInvestigationSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  subheadline: z.string().trim().max(300).optional(),
  summary: z.string().trim().min(1).max(800).optional(),
  coverImage: z.string().trim().max(500).optional(),
  category: z.string().trim().max(80).optional(),
  bodyHtml: z.string().max(50000).optional(),
  internalNotes: z.string().max(10000).optional(),
  collaborators: z.array(z.string().trim().min(1)).max(20).optional(),
})

export type UpdateInvestigationInput = z.infer<typeof updateInvestigationSchema>

export const rejectInvestigationSchema = z.object({
  reason: z.string().trim().min(1, 'A rejection reason is required').max(500),
})

export type RejectInvestigationInput = z.infer<typeof rejectInvestigationSchema>

export const addTimelineEntrySchema = z.object({
  date: z.string().trim().min(1, 'A date is required'),
  title: z.string().trim().min(1, 'A title is required').max(200),
  description: z.string().trim().min(1, 'A description is required').max(2000),
  visibility: z.enum(['public', 'internal']).default('internal'),
})

export type AddTimelineEntryInput = z.infer<typeof addTimelineEntrySchema>

export const addEditorCommentSchema = z.object({
  message: z.string().trim().min(1, 'A comment is required').max(2000),
})

export type AddEditorCommentInput = z.infer<typeof addEditorCommentSchema>

export const addInvestigationCommentSchema = z.object({
  content: z.string().trim().min(1, 'A comment is required').max(2000),
})

export type AddInvestigationCommentInput = z.infer<typeof addInvestigationCommentSchema>
