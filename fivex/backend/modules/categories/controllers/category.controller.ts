import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { categoryService } from '../services/category.service.js'
import type { CreateCategoryInput, UpdateCategoryInput } from '../validations/category.validation.js'

export const categoryController = {
  // Public: anyone (including signed-out readers) can see the category list,
  // it's needed to render category filters/nav on the public site.
  list: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.listCategories()
    res.status(200).json({ categories })
  }),

  // Admin-only: create a new article category.
  create: asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body as CreateCategoryInput
    const category = await categoryService.createCategory(name)
    res.status(201).json({ message: 'Category created successfully.', category })
  }),

  // Admin-only: rename an existing category.
  update: asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body as UpdateCategoryInput
    await categoryService.updateCategory(req.params.id, name)
    res.status(200).json({ message: 'Category updated successfully.' })
  }),

  // Admin-only: remove a category.
  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoryService.deleteCategory(req.params.id)
    res.status(200).json({ message: 'Category deleted successfully.' })
  }),
}
