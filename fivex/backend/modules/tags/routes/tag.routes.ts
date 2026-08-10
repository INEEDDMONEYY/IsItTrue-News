import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { tagController } from '../controllers/tag.controller.js'
import { createTagSchema, updateTagSchema } from '../validations/tag.validation.js'

const router = Router()

// Public: tag list is needed to render tag pages/filters on the public site.
router.get('/', tagController.list)

// Authors can create tags on the fly while writing an article, not just admins.
router.post(
  '/',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  validate(createTagSchema),
  tagController.create,
)

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateTagSchema),
  tagController.update,
)

router.delete('/:id', authenticate, authorize(ROLES.ADMIN), tagController.remove)

export const tagRoutes = router
