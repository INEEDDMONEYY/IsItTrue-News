import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import { ROLES, type Role } from '../../../shared/constants/roles.js'

export interface IAuthorProfile {
  professionalName?: string
  bio?: string
  location?: string
  website?: string
  profileImage?: string
  bannerImage?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    instagram?: string
  }
  primaryBeats?: string[]
  secondaryBeats?: string[]
  areasOfExpertise?: string[]
  geographicCoverage?: string[]
  languages?: string[]
  yearsOfExperience?: number
  defaultCategory?: string
  defaultVisibility?: 'draft' | 'editorial-review'
  factCheckingEnabled?: boolean
  sourceAttributionEnabled?: boolean
  allowEditorialSuggestions?: boolean
  editorialUpdates?: boolean
  assignmentNotifications?: boolean
  revisionNotifications?: boolean
  collaborationNotifications?: boolean
  investigationNotifications?: boolean
}

export interface IReaderProfile {
  // Reading Experience
  fontSize?: 'small' | 'medium' | 'large'
  theme?: 'light' | 'dark' | 'sepia'
  distractionFreeMode?: boolean
  autoSaveProgress?: boolean
  showEstimatedReadingTime?: boolean
  summariesFirst?: boolean
  // Content Preferences
  topics?: string[]
  regions?: string[]
  formats?: string[]
  depth?: 'quick-summaries' | 'full-investigative'
}

export interface IUserUsage {
  videosWatchedThisMonth: number
  // Article ids the free-plan reader has already unlocked this month —
  // re-reading an unlocked article never counts against the monthly cap.
  unlockedArticleIds: Types.ObjectId[]
  searchesThisMonth: number
  commentsThisMonth: number
  periodStart: Date
}

export interface IAuthorOnboarding {
  truthProtocolAcceptedAt?: Date
  completedAt?: Date
}

export interface IEditorOnboarding {
  editorialStandardsAcceptedAt?: Date
  completedAt?: Date
}

// Persistent (never reset monthly) read/watch history, unlike usage.* which
// only tracks the current free-plan cap period. Drives the reader's public
// profile "Library" tab. Most-recent-first, capped at 200 entries each.
export interface IReadingHistoryEntry {
  article: Types.ObjectId
  readAt: Date
}

export interface IWatchHistoryEntry {
  video: Types.ObjectId
  watchedAt: Date
}

export interface IUser {
  name: string
  email: string
  passwordHash: string
  role: Role
  // Contact name is stored in `name`; only set when role === 'organization'.
  organizationName?: string
  isEmailVerified: boolean
  emailVerificationTokenHash?: string
  emailVerificationExpires?: Date
  emailVerificationLastSentAt?: Date
  // Only the SHA-256 hash of the emailed reset token is stored, never the token itself.
  passwordResetTokenHash?: string
  passwordResetExpires?: Date
  passwordResetLastSentAt?: Date
  phone?: string
  isPhoneVerified: boolean
  phoneVerificationCodeHash?: string
  phoneVerificationExpires?: Date
  phoneVerificationLastSentAt?: Date
  authorProfile?: IAuthorProfile
  readerProfile?: IReaderProfile
  // Set once a reader completes the "Become an Author" onboarding flow.
  authorOnboarding?: IAuthorOnboarding
  // Set once a reader completes the "Become an Editor" onboarding flow.
  editorOnboarding?: IEditorOnboarding
  // Stripe billing isn't wired up yet — this just drives which dashboard
  // features are gated behind the paywall in the meantime.
  plan: 'free' | 'premium'
  usage: IUserUsage
  readingHistory: IReadingHistoryEntry[]
  watchHistory: IWatchHistoryEntry[]
  followers: Types.ObjectId[]
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
    organizationName: {
      type: String,
      trim: true,
      maxlength: 120,
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
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordResetLastSentAt: {
      type: Date,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCodeHash: {
      type: String,
      select: false,
    },
    phoneVerificationExpires: {
      type: Date,
      select: false,
    },
    phoneVerificationLastSentAt: {
      type: Date,
      select: false,
    },
    authorOnboarding: {
      type: new Schema<IAuthorOnboarding>(
        {
          truthProtocolAcceptedAt: { type: Date },
          completedAt: { type: Date },
        },
        { _id: false },
      ),
      default: undefined,
    },
    editorOnboarding: {
      type: new Schema<IEditorOnboarding>(
        {
          editorialStandardsAcceptedAt: { type: Date },
          completedAt: { type: Date },
        },
        { _id: false },
      ),
      default: undefined,
    },
    plan: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    authorProfile: {
      type: new Schema<IAuthorProfile>(
        {
          professionalName: { type: String, trim: true, maxlength: 80 },
          bio: { type: String, trim: true, maxlength: 1000 },
          location: { type: String, trim: true, maxlength: 120 },
          website: { type: String, trim: true, maxlength: 300 },
          profileImage: { type: String, trim: true, maxlength: 500 },
          bannerImage: { type: String, trim: true, maxlength: 500 },
          socialLinks: {
            twitter: { type: String, trim: true, maxlength: 200 },
            linkedin: { type: String, trim: true, maxlength: 200 },
            instagram: { type: String, trim: true, maxlength: 200 },
          },
          primaryBeats: { type: [String], default: [] },
          secondaryBeats: { type: [String], default: [] },
          areasOfExpertise: { type: [String], default: [] },
          geographicCoverage: { type: [String], default: [] },
          languages: { type: [String], default: [] },
          yearsOfExperience: { type: Number, min: 0 },
          defaultCategory: { type: String, trim: true, maxlength: 80 },
          defaultVisibility: { type: String, enum: ['draft', 'editorial-review'] },
          factCheckingEnabled: { type: Boolean },
          sourceAttributionEnabled: { type: Boolean },
          allowEditorialSuggestions: { type: Boolean },
          editorialUpdates: { type: Boolean },
          assignmentNotifications: { type: Boolean },
          revisionNotifications: { type: Boolean },
          collaborationNotifications: { type: Boolean },
          investigationNotifications: { type: Boolean },
        },
        { _id: false },
      ),
      default: {},
    },
    readerProfile: {
      type: new Schema<IReaderProfile>(
        {
          fontSize: { type: String, enum: ['small', 'medium', 'large'] },
          theme: { type: String, enum: ['light', 'dark', 'sepia'] },
          distractionFreeMode: { type: Boolean },
          autoSaveProgress: { type: Boolean },
          showEstimatedReadingTime: { type: Boolean },
          summariesFirst: { type: Boolean },
          topics: { type: [String], default: [] },
          regions: { type: [String], default: [] },
          formats: { type: [String], default: [] },
          depth: { type: String, enum: ['quick-summaries', 'full-investigative'] },
        },
        { _id: false },
      ),
      default: {},
    },
    usage: {
      type: new Schema<IUserUsage>(
        {
          videosWatchedThisMonth: { type: Number, default: 0 },
          unlockedArticleIds: { type: [Schema.Types.ObjectId], ref: 'Article', default: [] },
          searchesThisMonth: { type: Number, default: 0 },
          commentsThisMonth: { type: Number, default: 0 },
          periodStart: { type: Date, default: Date.now },
        },
        { _id: false },
      ),
      default: {},
    },
    readingHistory: {
      type: [
        new Schema<IReadingHistoryEntry>(
          {
            article: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
            readAt: { type: Date, default: Date.now },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    watchHistory: {
      type: [
        new Schema<IWatchHistoryEntry>(
          {
            video: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
            watchedAt: { type: Date, default: Date.now },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    followers: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        ret.followersCount = Array.isArray(ret.followers) ? ret.followers.length : 0
        delete ret._id
        delete ret.passwordHash
        delete ret.emailVerificationTokenHash
        delete ret.emailVerificationExpires
        delete ret.emailVerificationLastSentAt
        delete ret.passwordResetTokenHash
        delete ret.passwordResetExpires
        delete ret.passwordResetLastSentAt
        delete ret.phoneVerificationCodeHash
        delete ret.phoneVerificationExpires
        delete ret.phoneVerificationLastSentAt
        delete ret.followers
        delete ret.readingHistory
        delete ret.watchHistory
        delete ret.__v
        return ret
      },
    },
  },
)

// Reset links are looked up by token hash; only users with a pending reset carry the field.
userSchema.index({ passwordResetTokenHash: 1 }, { sparse: true })

export const User = model<IUser>('User', userSchema)
