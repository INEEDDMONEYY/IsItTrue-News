import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { bannerService } from '../services/banner.service.js'
import type { CreateBannerInput } from '../validations/banner.validation.js'

export const bannerController = {
  // Public: readers see only active banners on the site.
  listActive: asyncHandler(async (_req: Request, res: Response) => {
    const banners = await bannerService.listActive()
    res.status(200).json({ banners })
  }),

  // Admin-only: every banner, active or not, for the management page.
  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const banners = await bannerService.listAll()
    res.status(200).json({ banners })
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { message, tone } = req.body as CreateBannerInput
    const banner = await bannerService.createBanner(message, tone)
    res.status(201).json({ message: 'Banner created successfully.', banner })
  }),

  toggleActive: asyncHandler(async (req: Request, res: Response) => {
    await bannerService.toggleActive(req.params.id)
    res.status(200).json({ message: 'Banner updated successfully.' })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await bannerService.deleteBanner(req.params.id)
    res.status(200).json({ message: 'Banner deleted successfully.' })
  }),
}
