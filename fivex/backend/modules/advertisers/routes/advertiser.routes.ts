import { Router } from 'express'
import { authenticateAdvertiser } from '../../../middleware/authenticateAdvertiser.js'
import { authRateLimiter, emailRateLimiter } from '../../../middleware/rateLimiter.js'
import { adImageUpload } from '../../../middleware/upload.js'
import { validate } from '../../../middleware/validate.js'
import {
  forgotPasswordSchema,
  loginSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../../auth/validations/auth.validation.js'
import { advertiserController } from '../controllers/advertiser.controller.js'
import { advertiserWorkspaceController } from '../controllers/advertiserWorkspace.controller.js'
import {
  bundleInputSchema,
  campaignEditInputSchema,
  campaignInputSchema,
  changePasswordSchema,
  registerAdvertiserSchema,
  renameAssetSchema,
  updateNotificationsSchema,
  updateProfileSchema,
} from '../validations/advertiser.validation.js'

// Advertiser accounts, sign-in and data. Entirely separate from /api/auth: its own accounts, its own session
// cookie and its own signing key, so nothing here accepts a reader/author/editor/admin session or the reverse.
const router = Router()

router.post('/auth/register', emailRateLimiter, validate(registerAdvertiserSchema), advertiserController.register)
router.post(
  '/auth/resend-verification',
  emailRateLimiter,
  validate(resendVerificationSchema),
  advertiserController.resendVerification,
)
router.post('/auth/verify-email', authRateLimiter, validate(verifyEmailSchema), advertiserController.verifyEmail)
router.post('/auth/login', authRateLimiter, validate(loginSchema), advertiserController.login)
router.post('/auth/logout', advertiserController.logout)
router.get('/auth/me', authenticateAdvertiser, advertiserController.me)

// Both limiters on purpose: per IP, and per IP + email, so neither one address nor one inbox can be flooded.
router.post(
  '/auth/forgot-password',
  authRateLimiter,
  emailRateLimiter,
  validate(forgotPasswordSchema),
  advertiserController.forgotPassword,
)
router.post('/auth/reset-password', authRateLimiter, validate(resetPasswordSchema), advertiserController.resetPassword)

router.get('/overview', authenticateAdvertiser, advertiserController.overview)
router.get('/nav-counts', authenticateAdvertiser, advertiserController.navCounts)
// Public: the price list is shown to signed-out visitors too, and prices are only ever decided here.
router.get('/pricing', advertiserWorkspaceController.pricing)

// Everything below needs a signed-in, verified, non-suspended advertiser.
const workspace = Router()
workspace.use(authenticateAdvertiser)

workspace.get('/campaigns', advertiserWorkspaceController.listCampaigns)
workspace.post('/campaigns', validate(campaignInputSchema), advertiserWorkspaceController.createCampaign)
workspace.post('/campaigns/bundle', validate(bundleInputSchema), advertiserWorkspaceController.createBundle)
workspace.get('/campaigns/:id', advertiserWorkspaceController.getCampaign)
workspace.put('/campaigns/:id', validate(campaignEditInputSchema), advertiserWorkspaceController.updateCampaign)
workspace.post('/campaigns/:id/pause', advertiserWorkspaceController.pauseCampaign)
workspace.post('/campaigns/:id/resume', advertiserWorkspaceController.resumeCampaign)
workspace.delete('/campaigns/:id', advertiserWorkspaceController.deleteCampaign)

workspace.get('/library', advertiserWorkspaceController.listAssets)
workspace.post('/library', adImageUpload.single('file'), advertiserWorkspaceController.uploadAsset)
workspace.patch('/library/:id', validate(renameAssetSchema), advertiserWorkspaceController.renameAsset)
workspace.delete('/library/:id', advertiserWorkspaceController.deleteAsset)

workspace.get('/analytics', advertiserWorkspaceController.analytics)
workspace.get('/billing', advertiserWorkspaceController.billing)

workspace.put('/profile', validate(updateProfileSchema), advertiserWorkspaceController.updateProfile)
workspace.post('/profile/logo', adImageUpload.single('file'), advertiserWorkspaceController.uploadLogo)
workspace.delete('/profile/logo', advertiserWorkspaceController.removeLogo)

workspace.put('/settings/notifications', validate(updateNotificationsSchema), advertiserWorkspaceController.updateNotifications)
workspace.post(
  '/settings/password',
  authRateLimiter,
  validate(changePasswordSchema),
  advertiserWorkspaceController.changePassword,
)

router.use(workspace)

export const advertiserRoutes = router
