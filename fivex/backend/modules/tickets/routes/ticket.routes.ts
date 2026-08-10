import { Router } from 'express'
import { authenticate, optionalAuthenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { ticketController } from '../controllers/ticket.controller.js'
import { createTicketSchema } from '../validations/ticket.validation.js'

const router = Router()

// Public (optionally authenticated): anyone can submit a support ticket.
router.post(
  '/',
  optionalAuthenticate,
  validate(createTicketSchema),
  ticketController.create,
)

// Admin-only: the support inbox.
router.get('/', authenticate, authorize(ROLES.ADMIN), ticketController.listAll)

router.patch('/:id/toggle', authenticate, authorize(ROLES.ADMIN), ticketController.toggleStatus)

export const ticketRoutes = router
