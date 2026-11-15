import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { monitoringController } from '../controllers/monitoring.controller.js'

const router = Router()

// Admin only. Monitoring data includes error messages and security counts, so it is never public.
router.use(authenticate, authorize(ROLES.ADMIN))

router.get('/snapshot', monitoringController.snapshot)
router.get('/stream', monitoringController.stream)

export const monitoringRoutes = router
