import { Schema, model, type HydratedDocument } from 'mongoose'
import { ROLES, type Role } from '../../../shared/constants/roles.js'

export interface IUser {
  name: string
  email: string
  passwordHash: string
  role: Role
  isEmailVerified: boolean
  emailVerificationTokenHash?: string
  emailVerificationExpires?: Date
  emailVerificationLastSentAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type UserDocument = HydratedDocument<IUser>

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.READER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    emailVerificationLastSentAt: {
      type: Date,
      select: false,
    },
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
        delete ret.__v
        return ret
      },
    },
  },
)

export const User = model<IUser>('User', userSchema)
