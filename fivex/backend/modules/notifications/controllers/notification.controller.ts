import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { notificationService } from '../services/notification.service.js'

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError('You must be signed in to access this resource.', 401)
  }
  return req.user
}

export const notificationController = {
  listMine: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const notifications = await notificationService.listMine(user.id)
    res.status(200).json({ notifications })
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await notificationService.markAsRead(req.params.id, user.id)
    res.status(200).json({ message: 'Notification marked as read.' })
  }),

  markUnread: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await notificationService.markAsUnread(req.params.id, user.id)
    res.status(200).json({ message: 'Notification marked as unread.' })
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await notificationService.markAllAsRead(user.id)
    res.status(200).json({ message: 'All notifications marked as read.' })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await notificationService.remove(req.params.id, user.id)
    res.status(200).json({ message: 'Notification deleted.' })
  }),
}
