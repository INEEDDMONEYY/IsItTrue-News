import { Banner, type BannerDocument, type BannerTone } from '../models/Banner.js'

export interface CreateBannerInput {
  message: string
  tone: BannerTone
}

export const bannerRepository = {
  async findAll(): Promise<BannerDocument[]> {
    return Banner.find().sort({ createdAt: -1 })
  },

  async findActive(): Promise<BannerDocument[]> {
    return Banner.find({ active: true }).sort({ createdAt: -1 })
  },

  async findById(id: string): Promise<BannerDocument | null> {
    return Banner.findById(id)
  },

  async create(input: CreateBannerInput): Promise<BannerDocument> {
    return Banner.create({ message: input.message.trim(), tone: input.tone, active: true })
  },

  async setActive(id: string, active: boolean): Promise<void> {
    await Banner.updateOne({ _id: id }, { $set: { active } })
  },

  async deleteById(id: string): Promise<void> {
    await Banner.deleteOne({ _id: id })
  },
}
