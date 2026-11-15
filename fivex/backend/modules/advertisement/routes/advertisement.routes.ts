import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { advertisementController } from '../controllers/advertisement.controller.js'
import { advertiserStatusSchema, rejectCampaignSchema } from '../validations/advertisement.validation.js'

const router = Router()

// Admin only. Every advertisement endpoint exposes advertiser and campaign data across all accounts.
router.use(authenticate, authorize(ROLES.ADMIN))

router.get('/overview', advertisementController.overview)
router.get('/advertisers', advertisementController.listAdvertisers)
router.patch('/advertisers/:id/status', validate(advertiserStatusSchema), advertisementController.setAdvertiserStatus)
router.get('/campaigns', advertisementController.listCampaigns)
router.get('/approvals', advertisementController.approvals)
router.post('/campaigns/:id/approve', advertisementController.approveCampaign)
router.post('/campaigns/:id/reject', validate(rejectCampaignSchema), advertisementController.rejectCampaign)
router.get('/placements', advertisementController.placements)
router.get('/scheduling', advertisementController.scheduling)
router.get('/analytics', advertisementController.analytics)
router.get('/settings', advertisementController.settings)

export const advertisementRoutes = router
