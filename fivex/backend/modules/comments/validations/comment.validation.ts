import { z } from 'zod'

export const createCommentSchema = z.object({
  articleId: z.string().trim().min(1, 'Article id is required'),
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
