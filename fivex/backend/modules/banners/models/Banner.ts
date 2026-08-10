import { Schema, model, type HydratedDocument } from 'mongoose'

export const BANNER_TONES = ['info', 'warning', 'success'] as const
export type BannerTone = (typeof BANNER_TONES)[number]

export interface IBanner {
  message: string
  tone: BannerTone
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type BannerDocument = HydratedDocument<IBanner>

const bannerSchema = new Schema<IBanner>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 300,
    },
    tone: {
      type: String,
      enum: BANNER_TONES,
      default: 'info',
    },
    active: {
      type: Boolean,
      default: true,
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

export const Banner = model<IBanner>('Banner', bannerSchema)
