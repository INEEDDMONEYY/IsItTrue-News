import { Router } from 'express'
import { adTrackingRateLimiter } from '../../../middleware/rateLimiter.js'
import { publicAdController } from '../controllers/publicAd.controller.js'

const router = Router()

router.get('/', publicAdController.getAd)
router.post('/:campaignId/impressions', adTrackingRateLimiter, publicAdController.recordImpression)
router.get('/:campaignId/click', adTrackingRateLimiter, publicAdController.recordClick)

export const publicAdRoutes = router
