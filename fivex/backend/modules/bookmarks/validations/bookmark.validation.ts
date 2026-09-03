import { z } from 'zod'

export const toggleBookmarkSchema = z.object({
  contentType: z.enum(['article', 'video']),
  id: z.string().trim().min(1, 'Content id is required'),
})

export type ToggleBookmarkInput = z.infer<typeof toggleBookmarkSchema>
