import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(40, 'Name is too long'),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

export const updateCategorySchema = createCategorySchema

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
