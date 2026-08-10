import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { factCheckController } from '../controllers/factCheck.controller.js'
import {
  createFactCheckRequestSchema,
  rejectFactCheckRequestSchema,
} from '../validations/factCheck.validation.js'

const router = Router()

// Only authors/editors/admins may submit or view fact-check requests —
// readers never get this option, enforced here (not just hidden in the UI).
const CAN_SUBMIT = [ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN]

router.get(
  '/mine',
  authenticate,
  authorize(...CAN_SUBMIT),
  factCheckController.listMine,
)

// Admin-only: the verification queue and full history.
router.get('/pending', authenticate, authorize(ROLES.ADMIN), factCheckController.listPending)
router.get('/all', authenticate, authorize(ROLES.ADMIN), factCheckController.listAll)

router.post(
  '/',
  authenticate,
  authorize(...CAN_SUBMIT),
  validate(createFactCheckRequestSchema),
  factCheckController.create,
)

router.patch('/:id/approve', authenticate, authorize(ROLES.ADMIN), factCheckController.approve)

router.patch(
  '/:id/reject',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(rejectFactCheckRequestSchema),
  factCheckController.reject,
)

export const factCheckRoutes = router
