import { model, Schema, type HydratedDocument } from 'mongoose'
import { ADVERTISER_STATUSES, ALL_ADVERTISER_STATUSES, type AdvertiserStatus } from '../constants/advertiser.js'

export interface IAdvertiserAddress {
  line1: string
  line2: string
  city: string
  region: string
  postalCode: string
  country: string
}

export interface IAdvertiserProfile {
  contactName: string
  phone: string
  website: string
  industry: string
  description: string
  billingEmail: string
  logoUrl?: string
  logoPublicId?: string
  logoStorage?: 'cloudinary' | 'local'
  address: IAdvertiserAddress
}

export interface IAdvertiserNotifications {
  campaignStatus: boolean
  weeklyReport: boolean
  billing: boolean
}

export interface IAdvertiser {
  businessName: string
  email: string
  passwordHash: string
  status: AdvertiserStatus
  isEmailVerified: boolean
  profile: IAdvertiserProfile
  notifications: IAdvertiserNotifications
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

const addressSchema = new Schema<IAdvertiserAddress>(
  {
    line1: { type: String, trim: true, maxlength: 200, default: '' },
    line2: { type: String, trim: true, maxlength: 200, default: '' },
    city: { type: String, trim: true, maxlength: 100, default: '' },
    region: { type: String, trim: true, maxlength: 100, default: '' },
    postalCode: { type: String, trim: true, maxlength: 20, default: '' },
    country: { type: String, trim: true, maxlength: 100, default: '' },
  },
  { _id: false },
)

const profileSchema = new Schema<IAdvertiserProfile>(
  {
    contactName: { type: String, trim: true, maxlength: 120, default: '' },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    website: { type: String, trim: true, maxlength: 2048, default: '' },
    industry: { type: String, trim: true, maxlength: 80, default: '' },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    billingEmail: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
    logoUrl: { type: String },
    logoPublicId: { type: String },
    logoStorage: { type: String, enum: ['cloudinary', 'local'] },
    address: { type: addressSchema, default: () => ({}) },
  },
  { _id: false },
)

const notificationsSchema = new Schema<IAdvertiserNotifications>(
  {
    campaignStatus: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: false },
    billing: { type: Boolean, default: true },
  },
  { _id: false },
)

// A separate collection from users on purpose: advertisers have their own accounts, sign-in and sessions, and
// nothing here can be mistaken for (or promoted into) a reader/author/editor/admin account.
const advertiserSchema = new Schema<IAdvertiser>(
  {
    businessName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    status: { type: String, enum: ALL_ADVERTISER_STATUSES, default: ADVERTISER_STATUSES.PENDING },
    isEmailVerified: { type: Boolean, default: false },
    profile: { type: profileSchema, default: () => ({}) },
    notifications: { type: notificationsSchema, default: () => ({}) },
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
        const profile = ret.profile as Record<string, unknown> | undefined
        if (profile) {
          delete profile.logoPublicId
          delete profile.logoStorage
        }
        delete ret.__v
        return ret
      },
    },
  },
)

advertiserSchema.index({ emailVerificationTokenHash: 1 }, { sparse: true })
advertiserSchema.index({ passwordResetTokenHash: 1 }, { sparse: true })

export const Advertiser = model<IAdvertiser>('Advertiser', advertiserSchema)
