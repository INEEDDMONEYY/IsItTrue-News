import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { promotionalCodeController } from '../controllers/promotionalCode.controller.js'
import { promotionalCodeInputSchema } from '../validations/promotionalCode.validation.js'

const router = Router()

// Admin only. Promotional codes grant subscription rewards, so they are never public.
router.use(authenticate, authorize(ROLES.ADMIN))

router.get('/', promotionalCodeController.list)
router.post('/', validate(promotionalCodeInputSchema), promotionalCodeController.create)
router.put('/:id', validate(promotionalCodeInputSchema), promotionalCodeController.update)
router.delete('/:id', promotionalCodeController.remove)

export const promotionalCodeRoutes = router
