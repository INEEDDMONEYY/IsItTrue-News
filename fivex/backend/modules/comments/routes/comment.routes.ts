import { Router } from 'express'
import { authenticate, optionalAuthenticate } from '../../../middleware/authenticate.js'
import { validate } from '../../../middleware/validate.js'
import { commentController } from '../controllers/comment.controller.js'
import { createCommentSchema } from '../validations/comment.validation.js'

const router = Router()

// Public: anyone can read the comments on a published article. Optional auth
// so a signed-in viewer's own likes are still reflected in the response.
router.get('/article/:articleId', optionalAuthenticate, commentController.listByArticle)

// Declared before "/:id" so "mine"/"on-my-articles" are never swallowed by
// a param route.
router.get('/mine', authenticate, commentController.listMine)
router.get('/on-my-articles', authenticate, commentController.listOnMyArticles)

router.post('/', authenticate, validate(createCommentSchema), commentController.create)

router.post('/:id/like', authenticate, commentController.toggleLike)

router.delete('/:id', authenticate, commentController.remove)

export const commentRoutes = router
