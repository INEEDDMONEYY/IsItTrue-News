import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { bookmarkService } from '../services/bookmark.service.js'
import type { ToggleBookmarkInput } from '../validations/bookmark.validation.js'

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError('You must be signed in to access this resource.', 401)
  }
  return req.user
}

export const bookmarkController = {
  listMine: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const bookmarks = await bookmarkService.listMine(user.id)
    res.status(200).json({ bookmarks })
  }),

  toggle: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const { contentType, id } = req.body as ToggleBookmarkInput
    const result = await bookmarkService.toggle(contentType, id, user.id)
    res.status(200).json(result)
  }),
}
