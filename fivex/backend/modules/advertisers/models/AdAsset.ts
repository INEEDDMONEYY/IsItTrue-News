import { model, Schema, Types, type HydratedDocument } from 'mongoose'

export type AdAssetStorage = 'cloudinary' | 'local'

// An image in an advertiser's Ad Library, reusable across campaigns.
export interface IAdAsset {
  advertiser: Types.ObjectId
  name: string
  url: string
  publicId: string
  storage: AdAssetStorage
  format: string
  bytes: number
  width?: number
  height?: number
  createdAt: Date
  updatedAt: Date
}

export type AdAssetDocument = HydratedDocument<IAdAsset>

const adAssetSchema = new Schema<IAdAsset>(
  {
    advertiser: { type: Schema.Types.ObjectId, ref: 'Advertiser', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    url: { type: String, required: true },
    publicId: { type: String, required: true, select: false },
    storage: { type: String, enum: ['cloudinary', 'local'], required: true, select: false },
    format: { type: String, default: '' },
    bytes: { type: Number, default: 0 },
    width: { type: Number },
    height: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        ret.advertiser = String(ret.advertiser)
        delete ret._id
        delete ret.__v
        delete ret.publicId
        delete ret.storage
        return ret
      },
    },
  },
)

adAssetSchema.index({ advertiser: 1, createdAt: -1 })

export const AdAsset = model<IAdAsset>('AdAsset', adAssetSchema)
