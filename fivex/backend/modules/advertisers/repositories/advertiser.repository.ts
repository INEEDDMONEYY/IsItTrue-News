import { Advertiser, type AdvertiserDocument } from '../models/Advertiser.js'
import { ADVERTISER_STATUSES } from '../constants/advertiser.js'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export const advertiserRepository = {
  async findById(id: string): Promise<AdvertiserDocument | null> {
    return Advertiser.findById(id)
  },

  async findByEmail(email: string): Promise<AdvertiserDocument | null> {
    return Advertiser.findOne({ email: normalizeEmail(email) })
  },

  async findByEmailWithSecrets(email: string): Promise<AdvertiserDocument | null> {
    return Advertiser.findOne({ email: normalizeEmail(email) }).select('+passwordHash')
  },

  async findByEmailWithVerificationState(email: string): Promise<AdvertiserDocument | null> {
    return Advertiser.findOne({ email: normalizeEmail(email) }).select('+emailVerificationLastSentAt')
  },

  async findByEmailWithResetState(email: string): Promise<AdvertiserDocument | null> {
    return Advertiser.findOne({ email: normalizeEmail(email) }).select('+passwordResetLastSentAt')
  },

  async create(input: { businessName: string; email: string; passwordHash: string }): Promise<AdvertiserDocument> {
    return Advertiser.create({
      businessName: input.businessName.trim(),
      email: normalizeEmail(input.email),
      passwordHash: input.passwordHash,
    })
  },

  async setVerificationToken(id: string, tokenHash: string, expires: Date): Promise<void> {
    await Advertiser.updateOne(
      { _id: id },
      {
        $set: {
          emailVerificationTokenHash: tokenHash,
          emailVerificationExpires: expires,
          emailVerificationLastSentAt: new Date(),
        },
      },
    )
  },

  async findByVerificationTokenHash(tokenHash: string): Promise<AdvertiserDocument | null> {
    return Advertiser.findOne({ emailVerificationTokenHash: tokenHash }).select(
      '+emailVerificationTokenHash +emailVerificationExpires',
    )
  },

  // Confirms the email and activates a pending account in one atomic step. A suspended account stays suspended.
  async markEmailVerified(id: string): Promise<void> {
    await Advertiser.updateOne({ _id: id }, [
      {
        $set: {
          isEmailVerified: true,
          status: {
            $cond: [{ $eq: ['$status', ADVERTISER_STATUSES.PENDING] }, ADVERTISER_STATUSES.ACTIVE, '$status'],
          },
        },
      },
      { $unset: ['emailVerificationTokenHash', 'emailVerificationExpires'] },
    ])
  },

  async setPasswordResetToken(id: string, tokenHash: string, expires: Date): Promise<void> {
    await Advertiser.updateOne(
      { _id: id },
      {
        $set: {
          passwordResetTokenHash: tokenHash,
          passwordResetExpires: expires,
          passwordResetLastSentAt: new Date(),
        },
      },
    )
  },

  async findByPasswordResetTokenHash(tokenHash: string): Promise<AdvertiserDocument | null> {
    return Advertiser.findOne({ passwordResetTokenHash: tokenHash }).select(
      '+passwordResetTokenHash +passwordResetExpires',
    )
  },

  // Atomic: the filter and the update are one operation, so of two simultaneous uses of the same link only one
  // can succeed. It also stamps passwordChangedAt, which signs out every session issued before now.
  async consumePasswordResetToken(tokenHash: string, passwordHash: string): Promise<AdvertiserDocument | null> {
    return Advertiser.findOneAndUpdate(
      { passwordResetTokenHash: tokenHash, passwordResetExpires: { $gt: new Date() } },
      {
        $set: { passwordHash, passwordChangedAt: new Date() },
        $unset: { passwordResetTokenHash: '', passwordResetExpires: '' },
      },
      { new: true },
    )
  },

  async recordLogin(id: string): Promise<void> {
    await Advertiser.updateOne({ _id: id }, { $set: { lastLoginAt: new Date() } })
  },
}
