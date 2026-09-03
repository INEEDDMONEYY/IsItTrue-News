import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { validate } from '../../../middleware/validate.js'
import { topicSubmissionController } from '../controllers/topicSubmission.controller.js'
import { createTopicSubmissionSchema } from '../validations/topicSubmission.validation.js'

const router = Router()

router.post(
  '/',
  authenticate,
  validate(createTopicSubmissionSchema),
  topicSubmissionController.create,
)

router.get('/mine', authenticate, topicSubmissionController.listMine)

export const topicSubmissionRoutes = router
