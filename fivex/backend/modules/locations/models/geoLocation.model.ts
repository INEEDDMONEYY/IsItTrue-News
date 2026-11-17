import { Schema, model, type HydratedDocument } from 'mongoose'
import { LOCATION_LEVELS, type LocationLevel } from '../constants.js'

export interface IGeoLocation {
  locationId: string
  level: LocationLevel
  code: string
  name: string
  aliases: string[]
  parentId: string | null
  countryCode: string | null
  timezone: string | null
  latitude: number | null
  longitude: number | null
  source: string
}

const geoLocationSchema = new Schema<IGeoLocation>(
  {
    locationId: { type: String, required: true, unique: true, trim: true },
    level: { type: String, enum: [...LOCATION_LEVELS], required: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    aliases: { type: [String], default: [] },
    parentId: { type: String, default: null },
    countryCode: { type: String, default: null },
    timezone: { type: String, default: null },
    latitude: { type: Number, default: null, min: -90, max: 90 },
    longitude: { type: Number, default: null, min: -180, max: 180 },
    source: { type: String, default: 'seed' },
  },
  { timestamps: true },
)

geoLocationSchema.index({ parentId: 1, name: 1 })
geoLocationSchema.index({ name: 1 })
geoLocationSchema.index({ level: 1, latitude: 1 })

export type GeoLocationDocument = HydratedDocument<IGeoLocation>
export const GeoLocation = model<IGeoLocation>('GeoLocation', geoLocationSchema)
