import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { userController } from '../controllers/user.controller.js'
import {
  changeEmailSchema,
  changePasswordSchema,
  createUserSchema,
  updateNameSchema,
  updateRoleSchema,
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
router.patch('/me/email', authenticate, validate(changeEmailSchema), userController.changeOwnEmail)
router.patch('/me/password', authenticate, validate(changePasswordSchema), userController.changeOwnPassword)
router.delete('/me', authenticate, userController.deleteOwnAccount)

// Admin-only: manage another account's role or existence.
router.patch(
  '/:id/role',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateRoleSchema),
  userController.updateRole,
)
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), userController.remove)

export const userRoutes = router
