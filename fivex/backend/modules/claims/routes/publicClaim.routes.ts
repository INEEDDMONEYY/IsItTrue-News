import { Router } from 'express'
import { publicClaimController } from '../controllers/publicClaim.controller.js'

const router = Router()

// Open to everyone: these are the verified fact-checks readers see. Only claims with a recorded conclusion on a
// published article are ever returned (see publicClaim.repository).
router.get('/', publicClaimController.list)
// Declared before "/:id" so "article" is never read as an id.
router.get('/article/:slug', publicClaimController.forArticle)
router.get('/:id', publicClaimController.get)

export const publicClaimRoutes = router
