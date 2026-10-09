import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { analyticsService } from '../services/analytics.service.js'

export const analyticsController = {
  getOverview: asyncHandler(async (_req: Request, res: Response) => {
    const overview = await analyticsService.getOverview()
    // Live numbers for a dashboard: never let a browser or proxy serve a stale copy.
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ overview })
  }),
}
