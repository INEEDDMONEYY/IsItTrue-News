import { z } from 'zod'
import {
  ASSOCIATION_STATUSES,
  CONFIDENCE_LEVELS,
  GLOBAL_LOCATION_ID,
  PRECISION_LEVELS,
  RELATIONSHIP_TYPES,
  SELECTION_METHODS,
} from '../constants.js'

const locationIdSchema = z.string().trim().regex(/^[a-z_]+:[A-Za-z0-9.-]+$/).max(64)
const articleIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid article id')

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2).max(100),
  limit: z.coerce.number().int().min(1).max(20).default(10),
})

export const browseQuerySchema = z.object({
  parent: locationIdSchema.optional(),
})

export const nearestSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .refine((value) => value.latitude !== 0 || value.longitude !== 0, 'Invalid coordinates')

export const preferenceSchema = z
  .object({
    method: z.enum(SELECTION_METHODS),
    locationId: locationIdSchema,
  })
  .refine((value) => value.method !== 'global' || value.locationId === GLOBAL_LOCATION_ID, 'Global preference must use global:world')

export const discoverQuerySchema = z.object({
  locationId: locationIdSchema.refine((value) => value !== GLOBAL_LOCATION_ID, 'Global has no discovery scope'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const associationItemSchema = z.object({
  locationId: locationIdSchema,
  relationshipType: z.enum(RELATIONSHIP_TYPES),
  publicPrecision: z.enum(PRECISION_LEVELS),
  confidence: z.enum(CONFIDENCE_LEVELS).default('uncertain'),
})

export const associationsSchema = z.object({
  associations: z.array(associationItemSchema).max(50),
})

export const articleParamSchema = articleIdSchema
export const locationParamSchema = locationIdSchema
export const statusSchema = z.enum(ASSOCIATION_STATUSES)

export type AssociationsBody = z.infer<typeof associationsSchema>
