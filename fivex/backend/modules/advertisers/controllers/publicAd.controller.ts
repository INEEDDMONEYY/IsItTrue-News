import type { Request, Response } from 'express'
import { Types } from 'mongoose'
import { ALL_CAMPAIGN_PLACEMENTS, AD_TARGET_PAGES, type AdTargetPage, type CampaignPlacement } from '../constants/advertiser.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { publicAdService } from '../services/publicAd.service.js'

const CATEGORY_SLUG_PATTERN = /^[a-z0-9-]{1,100}$/

function queryString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

// Public and read-only. Serves one live ad for a placement, so it is safe to expose without a session.
export const publicAdController = {
  getAd: asyncHandler(async (req: Request, res: Response) => {
    const placement = queryString(req.query.placement)
    if (!placement || !(ALL_CAMPAIGN_PLACEMENTS as string[]).includes(placement)) {
      res.status(200).json({ ad: null })
      return
    }

    const page = queryString(req.query.page)
    const category = queryString(req.query.category)
    const ad = await publicAdService.findAd(placement as CampaignPlacement, {
      page: page && (AD_TARGET_PAGES as readonly string[]).includes(page) ? (page as AdTargetPage) : undefined,
      category: category && CATEGORY_SLUG_PATTERN.test(category) ? category : undefined,
    })

    res.status(200).json({ ad })
  }),

  recordImpression: asyncHandler(async (req: Request, res: Response) => {
    const campaignId = req.params.campaignId
    const counted = Types.ObjectId.isValid(campaignId) && (await publicAdService.recordImpression(campaignId))
    res.status(counted ? 204 : 404).end()
  }),

  // Counts the click, then sends the reader to the advertiser's destination.
  recordClick: asyncHandler(async (req: Request, res: Response) => {
    const campaignId = req.params.campaignId
    const destination = Types.ObjectId.isValid(campaignId) ? await publicAdService.recordClick(campaignId) : null
    if (!destination) {
      res.status(404).json({ message: 'This ad is no longer running.' })
      return
    }
    res.redirect(302, destination)
  }),
}
