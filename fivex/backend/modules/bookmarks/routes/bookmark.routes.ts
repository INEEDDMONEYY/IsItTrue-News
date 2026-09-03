import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { validate } from '../../../middleware/validate.js'
import { bookmarkController } from '../controllers/bookmark.controller.js'
import { toggleBookmarkSchema } from '../validations/bookmark.validation.js'

const router = Router()

router.get('/mine', authenticate, bookmarkController.listMine)
router.post('/toggle', authenticate, validate(toggleBookmarkSchema), bookmarkController.toggle)

export const bookmarkRoutes = router
