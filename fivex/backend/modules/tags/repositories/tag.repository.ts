import { Tag, type TagDocument } from '../models/Tag.js'

export const tagRepository = {
  async findAll(): Promise<TagDocument[]> {
    return Tag.find().sort({ name: 1 })
  },

  async findById(id: string): Promise<TagDocument | null> {
    return Tag.findById(id)
  },

  async findBySlug(slug: string): Promise<TagDocument | null> {
    return Tag.findOne({ slug })
  },

  async create(name: string, slug: string): Promise<TagDocument> {
    return Tag.create({ name: name.trim(), slug })
  },

  async updateName(id: string, name: string, slug: string): Promise<void> {
    await Tag.updateOne({ _id: id }, { $set: { name: name.trim(), slug } })
  },

  async deleteById(id: string): Promise<void> {
    await Tag.deleteOne({ _id: id })
  },

  async countAll(): Promise<number> {
    return Tag.countDocuments()
  },
}
