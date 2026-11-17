import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { dashboardNavController } from '../controllers/dashboardNav.controller.js'

const router = Router()

router.get('/nav-counts', authenticate, dashboardNavController.navCounts)

export const dashboardNavRoutes = router
