import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { mediaService } from '../services/media.service.js'

export const mediaController = {
  upload: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('No file was uploaded.', 400)
    }

    const media = await mediaService.uploadFile(req.file, req.user!.id)
    res.status(201).json({ media })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await mediaService.deleteFile(req.params.id)
    res.status(200).json({ message: 'Media deleted.' })
  }),
}
