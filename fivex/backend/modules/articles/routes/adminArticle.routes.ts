import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { adminArticleController } from '../controllers/adminArticle.controller.js'
import { adminArticleStatusSchema } from '../validations/adminArticle.validation.js'

const router = Router()

// Everything here is the admin's view of the whole article collection, whatever its status or author.
router.use(authenticate, authorize(ROLES.ADMIN))

router.get('/', adminArticleController.list)
router.get('/:id', adminArticleController.get)
router.get('/:id/audit', adminArticleController.audit)
router.patch('/:id/status', validate(adminArticleStatusSchema), adminArticleController.changeStatus)
router.delete('/:id', adminArticleController.remove)

export const adminArticleRoutes = router
