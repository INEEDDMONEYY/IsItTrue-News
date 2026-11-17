import type { Request, Response } from 'express'
import type { z } from 'zod'
import { AppError } from '../../../shared/errors/AppError.js'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import * as service from '../services/location.service.js'
import {
  articleParamSchema,
  associationsSchema,
  browseQuerySchema,
  discoverQuerySchema,
  locationParamSchema,
  nearestSchema,
  preferenceSchema,
  searchQuerySchema,
  type AssociationsBody,
} from '../validations/location.validation.js'

function requireUser(req: Request): { id: string; role: string } {
  const user = (req as Request & { user?: { id: string; role: string } }).user
  if (!user) throw new AppError('Authentication required', 401)
  return user
}

function parseInput<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input)
  if (!result.success) {
    throw new AppError(result.error.issues.map((issue) => issue.message).join('; '), 400)
  }
  return result.data
}

export const searchLocations = asyncHandler(async (req: Request, res: Response) => {
  const { q, limit } = parseInput(searchQuerySchema, req.query)
  res.json({ data: await service.searchLocations(q, limit) })
})

export const browseLocations = asyncHandler(async (req: Request, res: Response) => {
  const { parent } = parseInput(browseQuerySchema, req.query)
  res.json({ data: await service.browseLocations(parent ?? null) })
})

export const getLocation = asyncHandler(async (req: Request, res: Response) => {
  const locationId = parseInput(locationParamSchema, req.params.locationId)
  res.json({ data: await service.getLocation(locationId) })
})

export const nearestLocation = asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude } = parseInput(nearestSchema, req.body)
  res.json({ data: await service.nearestLocation(latitude, longitude) })
})

export const approximateLocation = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: await service.approximateCountryForIp(req.get('x-vercel-ip-country')) })
})

export const getReaderPreference = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  res.json({ data: await service.getReaderPreference(user.id) })
})

export const saveReaderPreference = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const input = parseInput(preferenceSchema, req.body)
  res.json({ data: await service.saveReaderPreference(user.id, input) })
})

export const getPublicArticleLocations = asyncHandler(async (req: Request, res: Response) => {
  const articleId = parseInput(articleParamSchema, req.params.articleId)
  res.json({ data: await service.getPublicArticleLocations(articleId) })
})

export const discoverArticles = asyncHandler(async (req: Request, res: Response) => {
  const { locationId, limit } = parseInput(discoverQuerySchema, req.query)
  res.json({ data: await service.discoverArticlesByLocation(locationId, limit) })
})

export const getReviewArticleLocations = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const articleId = parseInput(articleParamSchema, req.params.articleId)
  res.json({ data: await service.getReviewArticleLocations(articleId, user) })
})

export const saveArticleLocations = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const articleId = parseInput(articleParamSchema, req.params.articleId)
  const body: AssociationsBody = parseInput(associationsSchema, req.body)
  res.json({ data: await service.saveArticleLocations(articleId, user, body.associations) })
})
