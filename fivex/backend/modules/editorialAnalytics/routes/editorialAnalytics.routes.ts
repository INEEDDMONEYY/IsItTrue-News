import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { editorialAnalyticsController } from '../controllers/editorialAnalytics.controller.js'

const router = Router()

// Editorial performance, including per-author figures, is limited to editors and admins.
router.use(authenticate, authorize(ROLES.EDITOR, ROLES.ADMIN))
router.get('/overview', editorialAnalyticsController.getOverview)
router.get('/authors', editorialAnalyticsController.getAuthorPerformance)
router.get('/content-quality', editorialAnalyticsController.getContentQuality)
router.get('/workflow', editorialAnalyticsController.getWorkflow)
router.get('/fact-checks', editorialAnalyticsController.getFactChecks)
router.get('/investigations', editorialAnalyticsController.getInvestigations)
router.get('/article-performance', editorialAnalyticsController.getArticlePerformance)
// Exports share the authorization above, so they can never expose data the dashboard does not show.
router.get('/reports', editorialAnalyticsController.getReport)

export const editorialAnalyticsRoutes = router
