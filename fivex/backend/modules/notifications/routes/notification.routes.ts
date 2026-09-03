import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { notificationController } from '../controllers/notification.controller.js'

const router = Router()

router.get('/mine', authenticate, notificationController.listMine)
router.patch('/read-all', authenticate, notificationController.markAllRead)
router.patch('/:id/read', authenticate, notificationController.markRead)
router.patch('/:id/unread', authenticate, notificationController.markUnread)
router.delete('/:id', authenticate, notificationController.remove)

export const notificationRoutes = router
