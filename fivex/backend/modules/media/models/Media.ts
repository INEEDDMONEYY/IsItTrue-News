import { Schema, model, type HydratedDocument, type Types } from 'mongoose'

export const MEDIA_RESOURCE_TYPES = ['image', 'video'] as const
export type MediaResourceType = (typeof MEDIA_RESOURCE_TYPES)[number]

export interface IMedia {
  url: string
  publicId: string
  resourceType: MediaResourceType
  format: string
  bytes: number
  width?: number
  height?: number
  duration?: number
  uploadedBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type MediaDocument = HydratedDocument<IMedia>

const mediaSchema = new Schema<IMedia>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: {
      type: String,
      enum: MEDIA_RESOURCE_TYPES,
      required: true,
    },
    format: { type: String, required: true },
    bytes: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

export const Media = model<IMedia>('Media', mediaSchema)
