import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { correctionController } from '../controllers/correction.controller.js'
import {
  createCorrectionSchema,
  dismissCorrectionSchema,
  publishCorrectionSchema,
  recordFindingsSchema,
} from '../validations/correction.validation.js'

const router = Router()

const CAN_MANAGE = [ROLES.EDITOR, ROLES.ADMIN]

// Any signed-in user can flag a possible error on a published article.
router.post('/', authenticate, validate(createCorrectionSchema), correctionController.create)

// Everything below is the editors' workflow: queue -> investigation -> published (or dismissed).
router.get('/', authenticate, authorize(...CAN_MANAGE), correctionController.list)
router.get('/:id', authenticate, authorize(...CAN_MANAGE), correctionController.getById)
router.post('/:id/investigate', authenticate, authorize(...CAN_MANAGE), correctionController.startInvestigation)
router.patch(
  '/:id/findings',
  authenticate,
  authorize(...CAN_MANAGE),
  validate(recordFindingsSchema),
  correctionController.recordFindings,
)
router.post(
  '/:id/publish',
  authenticate,
  authorize(...CAN_MANAGE),
  validate(publishCorrectionSchema),
  correctionController.publish,
)
router.post(
  '/:id/dismiss',
  authenticate,
  authorize(...CAN_MANAGE),
  validate(dismissCorrectionSchema),
  correctionController.dismiss,
)

export const correctionRoutes = router
