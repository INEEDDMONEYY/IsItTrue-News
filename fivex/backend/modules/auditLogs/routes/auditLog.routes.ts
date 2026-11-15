import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { auditLogController } from '../controllers/auditLog.controller.js'

const router = Router()

// Admin only. Static paths are declared before "/:id" so they are not treated as ids.
router.use(authenticate, authorize(ROLES.ADMIN))

router.get('/summary', auditLogController.summary)
router.get('/actors', auditLogController.actors)
router.get('/', auditLogController.list)
router.get('/:id', auditLogController.getById)

export const auditLogRoutes = router
