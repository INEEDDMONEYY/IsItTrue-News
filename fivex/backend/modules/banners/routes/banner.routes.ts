import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { bannerController } from '../controllers/banner.controller.js'
import { createBannerSchema } from '../validations/banner.validation.js'

const router = Router()

// Public: only active banners, for the reader-facing site.
router.get('/', bannerController.listActive)

// Admin-only: full list (active + inactive) for the management page.
router.get('/all', authenticate, authorize(ROLES.ADMIN), bannerController.listAll)

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createBannerSchema),
  bannerController.create,
)

router.patch('/:id/toggle', authenticate, authorize(ROLES.ADMIN), bannerController.toggleActive)

router.delete('/:id', authenticate, authorize(ROLES.ADMIN), bannerController.remove)

export const bannerRoutes = router
