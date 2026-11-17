import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { dashboardNavCountsService } from '../services/dashboardNavCounts.service.js'

export const dashboardNavController = {
  navCounts: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const counts = await dashboardNavCountsService.forUser(req.user)
    res.status(200).json({ counts })
  }),
}
