import { Category, type CategoryDocument } from '../models/Category.js'

export const categoryRepository = {
  async findAll(): Promise<CategoryDocument[]> {
    return Category.find().sort({ name: 1 })
  },

  async findById(id: string): Promise<CategoryDocument | null> {
    return Category.findById(id)
  },

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    return Category.findOne({ slug })
  },

  async create(name: string, slug: string): Promise<CategoryDocument> {
    return Category.create({ name: name.trim(), slug })
  },

  async updateName(id: string, name: string, slug: string): Promise<void> {
    await Category.updateOne({ _id: id }, { $set: { name: name.trim(), slug } })
  },

  async deleteById(id: string): Promise<void> {
    await Category.deleteOne({ _id: id })
  },

  async countAll(): Promise<number> {
    return Category.countDocuments()
  },
}
