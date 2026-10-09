import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { analyticsController } from '../controllers/analytics.controller.js'

const router = Router()

// Platform-wide numbers, including the waitlist, are for admins only.
router.get('/overview', authenticate, authorize(ROLES.ADMIN), analyticsController.getOverview)

export const analyticsRoutes = router
