import { AppError } from '../../../shared/errors/AppError.js'
import { slugify } from '../../../utils/slug.js'
import { categoryRepository } from '../repositories/category.repository.js'
import { DEFAULT_CATEGORIES } from '../constants/categories.js'

export const categoryService = {
  async listCategories() {
    return categoryRepository.findAll()
  },

  async getBySlug(slug: string) {
    return categoryRepository.findBySlug(slug)
  },

  async createCategory(name: string) {
    const slug = slugify(name)
    if (!slug) {
      throw new AppError('Please provide a valid category name.', 400)
    }

    const existing = await categoryRepository.findBySlug(slug)
    if (existing) {
      throw new AppError('A category with that name already exists.', 409)
    }

    return categoryRepository.create(name, slug)
  },

  async updateCategory(id: string, name: string) {
    const slug = slugify(name)
    if (!slug) {
      throw new AppError('Please provide a valid category name.', 400)
    }

    const category = await categoryRepository.findById(id)
    if (!category) {
      throw new AppError('Category not found.', 404)
    }

    const existing = await categoryRepository.findBySlug(slug)
    if (existing && existing.id !== id) {
      throw new AppError('A category with that name already exists.', 409)
    }

    await categoryRepository.updateName(id, name, slug)
  },

  async deleteCategory(id: string) {
    const category = await categoryRepository.findById(id)
    if (!category) {
      throw new AppError('Category not found.', 404)
    }

    await categoryRepository.deleteById(id)
  },

  // Seeds the default category list so the app (and public nav) is usable
  // before an admin has created any categories manually. Idempotent — safe
  // to call on every boot, and picks up any newly added defaults without
  // duplicating categories that already exist.
  async ensureDefaultCategories() {
    for (const name of DEFAULT_CATEGORIES) {
      const slug = slugify(name)
      const existing = await categoryRepository.findBySlug(slug)
      if (!existing) {
        await categoryRepository.create(name, slug)
      }
    }
  },
}
