import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { claimController } from '../controllers/claim.controller.js'
import {
  createClaimSchema,
  setArticleFactCheckSchema,
  updateClaimSchema,
} from '../validations/claim.validation.js'

const router = Router()

// Fact-check oversight is an editorial function: editors and admins only.
router.use(authenticate, authorize(ROLES.EDITOR, ROLES.ADMIN))

router.get('/', claimController.list)
router.get('/articles', claimController.listArticles)

router.post('/', validate(createClaimSchema), claimController.create)

router.patch(
  '/articles/:articleId/fact-check',
  validate(setArticleFactCheckSchema),
  claimController.setArticleFactChecked,
)

router.post('/:id/take', claimController.takeResponsibility)
router.patch('/:id', validate(updateClaimSchema), claimController.update)
router.delete('/:id', claimController.remove)

export const claimRoutes = router
