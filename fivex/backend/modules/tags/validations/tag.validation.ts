import { z } from 'zod'

export const createTagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(30, 'Name is too long'),
})

export type CreateTagInput = z.infer<typeof createTagSchema>

export const updateTagSchema = createTagSchema

export type UpdateTagInput = z.infer<typeof updateTagSchema>
