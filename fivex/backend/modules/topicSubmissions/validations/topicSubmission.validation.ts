import { z } from 'zod'

export const createTopicSubmissionSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150, 'Title is too long'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(2000, 'Description is too long'),
  category: z.string().trim().max(60, 'Category is too long').optional(),
})

export type CreateTopicSubmissionInput = z.infer<typeof createTopicSubmissionSchema>
