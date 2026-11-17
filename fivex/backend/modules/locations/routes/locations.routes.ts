import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate } from '../../../middleware/authenticate.js'
import { validate } from '../../../middleware/validate.js'
import * as controller from '../controllers/location.controller.js'
import { hashIpForRateLimit } from '../services/location.service.js'
import { associationsSchema, nearestSchema, preferenceSchema } from '../validations/location.validation.js'

const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many location requests' },
})

const approximateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => hashIpForRateLimit(req.ip ?? ''),
  message: { message: 'Too many location requests' },
})

export const locationsRoutes = Router()

locationsRoutes.get('/search', readLimiter, controller.searchLocations)
locationsRoutes.get('/browse', readLimiter, controller.browseLocations)
locationsRoutes.post('/nearest', readLimiter, validate(nearestSchema), controller.nearestLocation)
locationsRoutes.get('/approximate', approximateLimiter, controller.approximateLocation)
locationsRoutes.get('/preference', authenticate, controller.getReaderPreference)
locationsRoutes.put('/preference', authenticate, validate(preferenceSchema), controller.saveReaderPreference)
locationsRoutes.get('/articles/:articleId/associations', controller.getPublicArticleLocations)
locationsRoutes.get('/discover', readLimiter, controller.discoverArticles)
locationsRoutes.get('/articles/:articleId/associations/review', authenticate, controller.getReviewArticleLocations)
locationsRoutes.put(
  '/articles/:articleId/associations',
  authenticate,
  validate(associationsSchema),
  controller.saveArticleLocations,
)
locationsRoutes.get('/:locationId', readLimiter, controller.getLocation)
