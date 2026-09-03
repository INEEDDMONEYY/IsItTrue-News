import { Router } from 'express'
import { authenticate, optionalAuthenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { authRateLimiter } from '../../../middleware/rateLimiter.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { userController } from '../controllers/user.controller.js'
import {
  becomeAuthorSchema,
  changeEmailSchema,
  changePasswordSchema,
  createUserSchema,
  sendPhoneCodeSchema,
  updateAuthorProfileSchema,
  updateNameSchema,
  updateReaderProfileSchema,
  updateRoleSchema,
  verifyPhoneCodeSchema,
} from '../validations/user.validation.js'

const router = Router()

// Any signed-in admin can list users; readers/authors/editors get a 403, and
// anyone without a valid session gets a 401 — enforced server-side regardless
// of what the frontend shows or hides.
router.get('/', authenticate, authorize(ROLES.ADMIN), userController.list)

// Admin-only: create a new account with an explicit role (e.g. another admin).
router.post('/', authenticate, authorize(ROLES.ADMIN), validate(createUserSchema), userController.create)

// Self-service routes — must be declared before the "/:id" routes below so
// "/me" is never swallowed by the ":id" param matcher.
router.patch('/me', authenticate, validate(updateNameSchema), userController.updateOwnName)
router.patch(
  '/me/author-profile',
  authenticate,
  validate(updateAuthorProfileSchema),
  userController.updateOwnAuthorProfile,
)
router.patch(
  '/me/reader-profile',
  authenticate,
  validate(updateReaderProfileSchema),
  userController.updateOwnReaderProfile,
)
router.get('/me/usage', authenticate, userController.getOwnUsage)
router.patch('/me/email', authenticate, validate(changeEmailSchema), userController.changeOwnEmail)
router.patch('/me/password', authenticate, validate(changePasswordSchema), userController.changeOwnPassword)
router.delete('/me', authenticate, userController.deleteOwnAccount)

// "Become an Author" onboarding — phone verification + role upgrade.
router.post(
  '/me/phone/send-code',
  authenticate,
  authRateLimiter,
  validate(sendPhoneCodeSchema),
  userController.sendPhoneVerificationCode,
)
router.post(
  '/me/phone/verify',
  authenticate,
  authRateLimiter,
  validate(verifyPhoneCodeSchema),
  userController.verifyPhoneCode,
)
router.post('/me/become-author', authenticate, validate(becomeAuthorSchema), userController.becomeAuthor)

// Admin-only: manage another account's role or existence.
router.patch(
  '/:id/role',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateRoleSchema),
  userController.updateRole,
)
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), userController.remove)

// Public: anyone can view an author's public profile page.
router.get('/:id/profile', optionalAuthenticate, userController.getPublicProfile)

// Public: every article/video/comment the target user has liked.
router.get('/:id/library', userController.getLibrary)

// Any signed-in user: follow/unfollow another author.
router.post('/:id/follow', authenticate, userController.toggleFollow)

export const userRoutes = router
