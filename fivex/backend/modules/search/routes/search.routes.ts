import { Router } from 'express'
import { optionalAuthenticate } from '../../../middleware/authenticate.js'
import { searchController } from '../controllers/search.controller.js'

const router = Router()

// Anonymous visitors can search unlimited times but only get unfiltered,
// "all types" results (see searchService.search); free-plan readers get
// FREE_PLAN_LIMITS.searchesPerMonth filtered searches, premium is unlimited.
router.get('/', optionalAuthenticate, searchController.search)

export const searchRoutes = router
