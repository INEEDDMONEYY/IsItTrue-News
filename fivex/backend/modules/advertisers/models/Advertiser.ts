import { model, Schema, type HydratedDocument } from 'mongoose'
import { ADVERTISER_STATUSES, ALL_ADVERTISER_STATUSES, type AdvertiserStatus } from '../constants/advertiser.js'

export interface IAdvertiser {
  businessName: string
  email: string
  passwordHash: string
  status: AdvertiserStatus
  isEmailVerified: boolean
  // Only the SHA-256 hash of an emailed token is ever stored, never the token itself.
  emailVerificationTokenHash?: string
  emailVerificationExpires?: Date
  emailVerificationLastSentAt?: Date
  passwordResetTokenHash?: string
  passwordResetExpires?: Date
  passwordResetLastSentAt?: Date
  // Sessions issued before this moment are no longer valid (set whenever the password changes).
  passwordChangedAt?: Date
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type AdvertiserDocument = HydratedDocument<IAdvertiser>

// A separate collection from users on purpose: advertisers have their own accounts, sign-in and sessions, and
// nothing here can be mistaken for (or promoted into) a reader/author/editor/admin account.
const advertiserSchema = new Schema<IAdvertiser>(
  {
    businessName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    status: { type: String, enum: ALL_ADVERTISER_STATUSES, default: ADVERTISER_STATUSES.PENDING },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    emailVerificationLastSentAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordResetLastSentAt: { type: Date, select: false },
    passwordChangedAt: { type: Date },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        delete ret._id
        delete ret.passwordHash
        delete ret.emailVerificationTokenHash
        delete ret.emailVerificationExpires
        delete ret.emailVerificationLastSentAt
        delete ret.passwordResetTokenHash
        delete ret.passwordResetExpires
        delete ret.passwordResetLastSentAt
        delete ret.passwordChangedAt
        delete ret.__v
        return ret
      },
    },
  },
)

advertiserSchema.index({ emailVerificationTokenHash: 1 }, { sparse: true })
advertiserSchema.index({ passwordResetTokenHash: 1 }, { sparse: true })

export const Advertiser = model<IAdvertiser>('Advertiser', advertiserSchema)
