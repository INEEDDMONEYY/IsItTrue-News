import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { categoryController } from '../controllers/category.controller.js'
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation.js'

const router = Router()

// Public: category list is needed to render the public site's nav/filters.
router.get('/', categoryController.list)

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createCategorySchema),
  categoryController.create,
)

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateCategorySchema),
  categoryController.update,
)

router.delete('/:id', authenticate, authorize(ROLES.ADMIN), categoryController.remove)

export const categoryRoutes = router
