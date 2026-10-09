import { Schema, model, type HydratedDocument } from 'mongoose'
import { WAITLIST_INTERESTS, type WaitlistInterest } from '../constants/waitlistInterest.js'

export interface IWaitlistSignup {
  email: string
  name?: string
  interest?: WaitlistInterest
  createdAt: Date
  updatedAt: Date
}

export type WaitlistSignupDocument = HydratedDocument<IWaitlistSignup>

const waitlistSignupSchema = new Schema<IWaitlistSignup>(
  {
    // Stored lowercase; the unique index is what makes repeat signups harmless.
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, unique: true },
    name: { type: String, trim: true, maxlength: 80 },
    interest: { type: String, enum: WAITLIST_INTERESTS },
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

export const WaitlistSignup = model<IWaitlistSignup>('WaitlistSignup', waitlistSignupSchema)
