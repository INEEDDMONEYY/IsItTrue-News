import { PromotionalCode, type PromotionalCodeDocument } from '../models/PromotionalCode.js'
import type { PromotionalCodeInput } from '../validations/promotionalCode.validation.js'

export const promotionalCodeRepository = {
  async findAll(): Promise<PromotionalCodeDocument[]> {
    return PromotionalCode.find().sort({ createdAt: -1 })
  },

  async findById(id: string): Promise<PromotionalCodeDocument | null> {
    return PromotionalCode.findById(id)
  },

  async create(input: PromotionalCodeInput): Promise<PromotionalCodeDocument> {
    return PromotionalCode.create(input)
  },

  async updateById(id: string, input: PromotionalCodeInput): Promise<PromotionalCodeDocument | null> {
    return PromotionalCode.findByIdAndUpdate(id, input, { new: true, runValidators: true })
  },

  async deleteById(id: string): Promise<void> {
    await PromotionalCode.findByIdAndDelete(id)
  },
}
