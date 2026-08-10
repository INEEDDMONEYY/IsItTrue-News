import { AppError } from '../../../shared/errors/AppError.js'
import { bannerRepository } from '../repositories/banner.repository.js'
import type { BannerTone } from '../models/Banner.js'

export const bannerService = {
  async listAll() {
    return bannerRepository.findAll()
  },

  async listActive() {
    return bannerRepository.findActive()
  },

  async createBanner(message: string, tone: BannerTone) {
    return bannerRepository.create({ message, tone })
  },

  async toggleActive(id: string) {
    const banner = await bannerRepository.findById(id)
    if (!banner) {
      throw new AppError('Banner not found.', 404)
    }
    await bannerRepository.setActive(id, !banner.active)
  },

  async deleteBanner(id: string) {
    const banner = await bannerRepository.findById(id)
    if (!banner) {
      throw new AppError('Banner not found.', 404)
    }
    await bannerRepository.deleteById(id)
  },
}
