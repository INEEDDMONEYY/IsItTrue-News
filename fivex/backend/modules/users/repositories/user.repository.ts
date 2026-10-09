import { Types } from 'mongoose'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { User, type UserDocument, type IAuthorProfile, type IReaderProfile } from '../models/User.js'

export interface CreateUserInput {
  name: string
  email: string
  passwordHash: string
  role?: Role
  organizationName?: string
  isEmailVerified?: boolean
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email: normalizeEmail(email) })
  },

  async findByEmailWithSecrets(email: string): Promise<UserDocument | null> {
    return User.findOne({ email: normalizeEmail(email) }).select(
      '+passwordHash +emailVerificationTokenHash +emailVerificationExpires +emailVerificationLastSentAt',
    )
  },

  async findById(id: string): Promise<UserDocument | null> {
    return User.findById(id)
  },

  async findIdsByRole(role: Role): Promise<string[]> {
    const users = await User.find({ role }).select('_id')
    return users.map((user) => String(user._id))
  },

  async findByIdWithSecrets(id: string): Promise<UserDocument | null> {
    return User.findById(id).select('+passwordHash')
  },

  async findByVerificationTokenHash(tokenHash: string): Promise<UserDocument | null> {
    return User.findOne({ emailVerificationTokenHash: tokenHash }).select(
      '+emailVerificationTokenHash +emailVerificationExpires',
    )
  },

  async create(input: CreateUserInput): Promise<UserDocument> {
    return User.create({
      name: input.name.trim(),
      email: normalizeEmail(input.email),
      passwordHash: input.passwordHash,
      ...(input.role ? { role: input.role } : {}),
      ...(input.organizationName ? { organizationName: input.organizationName.trim() } : {}),
      ...(input.isEmailVerified ? { isEmailVerified: input.isEmailVerified } : {}),
    })
  },

  async setVerificationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          emailVerificationTokenHash: tokenHash,
          emailVerificationExpires: expiresAt,
          emailVerificationLastSentAt: new Date(),
        },
      },
    )
  },

  async markEmailVerified(userId: string): Promise<void> {
    await User.updateOne(
      { _id: userId },
      {
        $set: { isEmailVerified: true },
        $unset: {
          emailVerificationTokenHash: '',
          emailVerificationExpires: '',
        },
      },
    )
  },

  async findAll(): Promise<UserDocument[]> {
    return User.find().sort({ createdAt: -1 })
  },

  async updateName(userId: string, name: string): Promise<void> {
    await User.updateOne({ _id: userId }, { $set: { name: name.trim() } })
  },

  async updateAuthorProfile(userId: string, updates: Partial<IAuthorProfile>): Promise<void> {
    const set: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      set[`authorProfile.${key}`] = value
    }
    await User.updateOne({ _id: userId }, { $set: set })
  },

  async updateReaderProfile(userId: string, updates: Partial<IReaderProfile>): Promise<void> {
    const set: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      set[`readerProfile.${key}`] = value
    }
    await User.updateOne({ _id: userId }, { $set: set })
  },

  async setPhoneVerificationCode(
    userId: string,
    phone: string,
    codeHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          phone,
          isPhoneVerified: false,
          phoneVerificationCodeHash: codeHash,
          phoneVerificationExpires: expiresAt,
          phoneVerificationLastSentAt: new Date(),
        },
      },
    )
  },

  async findByIdWithPhoneSecrets(id: string): Promise<UserDocument | null> {
    return User.findById(id).select('+phoneVerificationCodeHash +phoneVerificationExpires')
  },

  async markPhoneVerified(userId: string): Promise<void> {
    await User.updateOne(
      { _id: userId },
      {
        $set: { isPhoneVerified: true },
        $unset: { phoneVerificationCodeHash: '', phoneVerificationExpires: '' },
      },
    )
  },

  async completeAuthorOnboarding(
    userId: string,
    input: {
      fullName: string
      profilePhotoUrl?: string
      shortBio?: string
      socialLinks?: IAuthorProfile['socialLinks']
    },
  ): Promise<void> {
    const now = new Date()
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          name: input.fullName.trim(),
          role: ROLES.AUTHOR,
          'authorProfile.professionalName': input.fullName.trim(),
          ...(input.profilePhotoUrl ? { 'authorProfile.profileImage': input.profilePhotoUrl } : {}),
          ...(input.shortBio ? { 'authorProfile.bio': input.shortBio } : {}),
          ...(input.socialLinks ? { 'authorProfile.socialLinks': input.socialLinks } : {}),
          'authorOnboarding.truthProtocolAcceptedAt': now,
          'authorOnboarding.completedAt': now,
        },
      },
    )
  },

  async completeEditorOnboarding(
    userId: string,
    input: {
      fullName: string
      profilePhotoUrl?: string
      shortBio?: string
      socialLinks?: IAuthorProfile['socialLinks']
    },
  ): Promise<void> {
    const now = new Date()
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          name: input.fullName.trim(),
          role: ROLES.EDITOR,
          'authorProfile.professionalName': input.fullName.trim(),
          ...(input.profilePhotoUrl ? { 'authorProfile.profileImage': input.profilePhotoUrl } : {}),
          ...(input.shortBio ? { 'authorProfile.bio': input.shortBio } : {}),
          ...(input.socialLinks ? { 'authorProfile.socialLinks': input.socialLinks } : {}),
          'editorOnboarding.editorialStandardsAcceptedAt': now,
          'editorOnboarding.completedAt': now,
        },
      },
    )
  },

  // Resets the monthly usage counters when the stored period has rolled into
  // a new calendar month. Safe to call before every read/increment.
  async resetUsageIfNeeded(userId: string): Promise<void> {
    const user = await User.findById(userId).select('usage')
    if (!user) return

    const now = new Date()
    const periodStart = user.usage?.periodStart ?? new Date(0)
    const isNewMonth =
      periodStart.getUTCFullYear() !== now.getUTCFullYear() ||
      periodStart.getUTCMonth() !== now.getUTCMonth()

    if (isNewMonth) {
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            'usage.videosWatchedThisMonth': 0,
            'usage.unlockedArticleIds': [],
            'usage.searchesThisMonth': 0,
            'usage.commentsThisMonth': 0,
            'usage.periodStart': now,
          },
        },
      )
    }
  },

  // Idempotent — unlocking an article the reader already unlocked this month
  // doesn't consume another slot of their monthly cap.
  async unlockArticleForUser(userId: string, articleId: string): Promise<void> {
    await User.updateOne(
      { _id: userId },
      { $addToSet: { 'usage.unlockedArticleIds': new Types.ObjectId(articleId) } },
    )
  },

  async incrementVideosWatched(userId: string): Promise<void> {
    await this.resetUsageIfNeeded(userId)
    await User.updateOne({ _id: userId }, { $inc: { 'usage.videosWatchedThisMonth': 1 } })
  },

  async incrementSearches(userId: string): Promise<void> {
    await User.updateOne({ _id: userId }, { $inc: { 'usage.searchesThisMonth': 1 } })
  },

  async incrementComments(userId: string): Promise<void> {
    await User.updateOne({ _id: userId }, { $inc: { 'usage.commentsThisMonth': 1 } })
  },

  // Persistent read/watch history (not part of the monthly-reset usage
  // counters) — drives the reader's public profile "Library" tab. The pull
  // then push keeps entries deduped and moves a re-read/re-watched item back
  // to the front with an updated timestamp.
  async recordArticleRead(userId: string, articleId: string): Promise<void> {
    const oid = new Types.ObjectId(articleId)
    await User.updateOne({ _id: userId }, { $pull: { readingHistory: { article: oid } } })
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          readingHistory: { $each: [{ article: oid, readAt: new Date() }], $position: 0, $slice: 200 },
        },
      },
    )
  },

  async recordVideoWatch(userId: string, videoId: string): Promise<void> {
    const oid = new Types.ObjectId(videoId)
    await User.updateOne({ _id: userId }, { $pull: { watchHistory: { video: oid } } })
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          watchHistory: { $each: [{ video: oid, watchedAt: new Date() }], $position: 0, $slice: 200 },
        },
      },
    )
  },

  async findHistoryById(userId: string): Promise<UserDocument | null> {
    return User.findById(userId)
      .select('readingHistory watchHistory')
      .populate('readingHistory.article')
      .populate('watchHistory.video')
  },

  async updateEmail(userId: string, email: string): Promise<void> {
    await User.updateOne(
      { _id: userId },
      { $set: { email: normalizeEmail(email), isEmailVerified: false } },
    )
  },

  async updateRole(userId: string, role: Role): Promise<void> {
    await User.updateOne({ _id: userId }, { $set: { role } })
  },

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await User.updateOne({ _id: userId }, { $set: { passwordHash } })
  },

  async deleteById(userId: string): Promise<void> {
    await User.deleteOne({ _id: userId })
  },

  // Toggles whether `userId` follows `targetId` — mirrors the article/video
  // like toggle pattern.
  async toggleFollow(
    targetId: string,
    userId: string,
  ): Promise<{ following: boolean; followersCount: number } | null> {
    const target = await User.findById(targetId)
    if (!target) return null

    const alreadyFollowing = target.followers.some((id) => id.toString() === userId)
    if (alreadyFollowing) {
      target.followers = target.followers.filter((id) => id.toString() !== userId)
    } else {
      target.followers.push(new Types.ObjectId(userId))
    }
    await target.save()

    return { following: !alreadyFollowing, followersCount: target.followers.length }
  },

  async countAdmins(excludingUserId?: string): Promise<number> {
    const filter: Record<string, unknown> = { role: ROLES.ADMIN }
    if (excludingUserId) {
      filter._id = { $ne: excludingUserId }
    }
    return User.countDocuments(filter)
  },
}
