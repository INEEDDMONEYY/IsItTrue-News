import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { User, type UserDocument } from '../models/User.js'

export interface CreateUserInput {
  name: string
  email: string
  passwordHash: string
  role?: Role
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

  async countAdmins(excludingUserId?: string): Promise<number> {
    const filter: Record<string, unknown> = { role: ROLES.ADMIN }
    if (excludingUserId) {
      filter._id = { $ne: excludingUserId }
    }
    return User.countDocuments(filter)
  },
}
