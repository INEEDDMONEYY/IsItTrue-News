import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { FREE_PLAN_LIMITS } from '../../../shared/constants/plan.js'
import { FREE_PLAN_LIMITS_ENFORCED, hasPremiumAccess } from '../../../shared/constants/features.js'
import { assertDeliverableEmail } from '../../../security/emailValidator.js'
import { comparePassword, hashPassword } from '../../../utils/password.js'
import { generateVerificationCode, hashToken } from '../../../utils/tokens.js'
import { logger } from '../../../config/logger.js'
import { issueAndSendVerificationEmail } from '../../auth/services/emailVerification.service.js'
import { articleRepository } from '../../articles/repositories/article.repository.js'
import { videoRepository } from '../../videos/repositories/video.repository.js'
import { commentRepository } from '../../comments/repositories/comment.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import type { IAuthorProfile, IReaderProfile, UserDocument } from '../models/User.js'
import type { BecomeAuthorInput, BecomeEditorInput } from '../validations/user.validation.js'

// The photo/bio can come from the onboarding form or from what the user already
// saved in their settings — one of the two must exist.
function assertProfileComplete(
  user: UserDocument,
  input: Pick<BecomeAuthorInput, 'profilePhotoUrl' | 'shortBio'>,
): void {
  if (!input.profilePhotoUrl && !user.authorProfile?.profileImage) {
    throw new AppError('A profile photo is required.', 400)
  }
  if (!input.shortBio && !user.authorProfile?.bio) {
    throw new AppError('A short bio is required.', 400)
  }
}

export interface LibraryItem {
  id: string
  type: 'article' | 'video' | 'comment'
  title: string
  excerpt?: string
  thumbnailUrl?: string
  href: string
  createdAt: string
}

export const userService = {
  async listUsers() {
    return userRepository.findAll()
  },

  async createUser(input: { name: string; email: string; password: string; role: Role }) {
    const existing = await userRepository.findByEmail(input.email)
    if (existing) {
      throw new AppError('An account with that email already exists.', 409)
    }

    const passwordHash = await hashPassword(input.password)
    return userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      // Admin-created accounts skip the email verification flow.
      isEmailVerified: true,
    })
  },

  async updateRole(targetUserId: string, role: Role, actingUserId: string) {
    if (targetUserId === actingUserId && role !== ROLES.ADMIN) {
      throw new AppError('You cannot remove your own admin access.', 400)
    }

    const user = await userRepository.findById(targetUserId)
    if (!user) {
      throw new AppError('User not found.', 404)
    }

    if (user.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
      const remainingAdmins = await userRepository.countAdmins(targetUserId)
      if (remainingAdmins === 0) {
        throw new AppError('At least one admin account must remain.', 400)
      }
    }

    await userRepository.updateRole(targetUserId, role)
  },

  async deleteUser(targetUserId: string, actingUserId: string) {
    if (targetUserId === actingUserId) {
      throw new AppError(
        'Use the delete account option in your own settings to remove your account.',
        400,
      )
    }

    const user = await userRepository.findById(targetUserId)
    if (!user) {
      throw new AppError('User not found.', 404)
    }

    if (user.role === ROLES.ADMIN) {
      const remainingAdmins = await userRepository.countAdmins(targetUserId)
      if (remainingAdmins === 0) {
        throw new AppError('At least one admin account must remain.', 400)
      }
    }

    await userRepository.deleteById(targetUserId)
  },

  async updateOwnName(userId: string, name: string) {
    await userRepository.updateName(userId, name)
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }
    return user
  },

  async updateOwnAuthorProfile(userId: string, updates: Partial<IAuthorProfile>) {
    await userRepository.updateAuthorProfile(userId, updates)
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }
    return user
  },

  async updateOwnReaderProfile(userId: string, updates: Partial<IReaderProfile>) {
    await userRepository.updateReaderProfile(userId, updates)
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }
    return user
  },

  // Drives the "Free Plan Usage Tracking" widget in the reader sidebar.
  async getOwnUsage(userId: string) {
    await userRepository.resetUsageIfNeeded(userId)
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }

    const unlimitedArticles = hasPremiumAccess('unlimitedArticles', user.plan)
    const unlimitedSearch = hasPremiumAccess('unlimitedSearch', user.plan)
    const unlimitedComments = hasPremiumAccess('unlimitedComments', user.plan)
    const periodStart = user.usage?.periodStart ?? new Date()
    const resetDate = new Date(
      Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() + 1, 1),
    )
    const articlesRead = user.usage?.unlockedArticleIds?.length ?? 0
    const searchesUsed = user.usage?.searchesThisMonth ?? 0
    const commentsUsed = user.usage?.commentsThisMonth ?? 0

    return {
      plan: user.plan,
      // False once every paywalled feature is unlocked, so the sidebar hides the free-plan widget.
      limitsEnforced: FREE_PLAN_LIMITS_ENFORCED && user.plan !== 'premium',
      articlesRead,
      articlesLimit: unlimitedArticles ? null : FREE_PLAN_LIMITS.articlesPerMonth,
      articlesRemaining: unlimitedArticles
        ? null
        : Math.max(0, FREE_PLAN_LIMITS.articlesPerMonth - articlesRead),
      // Videos aren't capped by count — free-plan viewers get unlimited
      // short clips/previews, but full videos over this length require
      // premium (see article/video service content-gating).
      maxFreeVideoDurationSeconds: FREE_PLAN_LIMITS.maxFreeVideoDurationSeconds,
      searchesUsed,
      searchesLimit: unlimitedSearch ? null : FREE_PLAN_LIMITS.searchesPerMonth,
      searchesRemaining: unlimitedSearch
        ? null
        : Math.max(0, FREE_PLAN_LIMITS.searchesPerMonth - searchesUsed),
      commentsUsed,
      commentsLimit: unlimitedComments ? null : FREE_PLAN_LIMITS.commentsPerMonth,
      commentsRemaining: unlimitedComments
        ? null
        : Math.max(0, FREE_PLAN_LIMITS.commentsPerMonth - commentsUsed),
      resetDate: resetDate.toISOString(),
    }
  },


  // Public, no-auth-required author profile (name/bio/avatar/stats) shown at
  // /authors/:id. Safe fields only — toJSON already strips secrets. Stats
  // are role-specific: readers don't publish, so they get liked-content
  // counts instead of authored-article/video/verified counts.
  async getPublicProfile(targetId: string, viewerId?: string) {
    const user = await userRepository.findById(targetId)
    if (!user) {
      throw new AppError('Author not found.', 404)
    }

    const isFollowing = viewerId
      ? user.followers.some((id) => id.toString() === viewerId)
      : false

    if (user.role === ROLES.READER) {
      const [articlesLiked, videosLiked] = await Promise.all([
        articleRepository.countLikedByUser(targetId),
        videoRepository.countLikedByUser(targetId),
      ])
      return { user, isFollowing, stats: { articlesLiked, videosLiked } }
    }

    const [articlesCount, videosCount, factChecksVerified] = await Promise.all([
      articleRepository.countPublishedByAuthor(targetId),
      videoRepository.countPublishedByAuthor(targetId),
      articleRepository.countVerifiedByAuthor(targetId),
    ])

    return {
      user,
      isFollowing,
      stats: { articles: articlesCount, videos: videosCount, factChecksVerified },
    }
  },

  async toggleFollow(targetId: string, viewerId: string) {
    if (targetId === viewerId) {
      throw new AppError('You cannot follow yourself.', 400)
    }
    const result = await userRepository.toggleFollow(targetId, viewerId)
    if (!result) {
      throw new AppError('Author not found.', 404)
    }
    return result
  },

  // Public "Library" tab: readers get their read/watch history (they don't
  // publish or like content the same way authors' followers expect); authors
  // (and editors/admins) keep the original behaviour — every published
  // article/video and every comment they've liked, merged into one feed.
  async getLibrary(targetId: string): Promise<LibraryItem[]> {
    const user = await userRepository.findById(targetId)
    if (!user) {
      throw new AppError('Author not found.', 404)
    }

    if (user.role === ROLES.READER) {
      return this.getReadWatchHistory(targetId)
    }

    const [articles, videos, comments] = await Promise.all([
      articleRepository.findLikedByUser(targetId),
      videoRepository.findLikedByUser(targetId),
      commentRepository.findLikedByUser(targetId),
    ])

    const items: LibraryItem[] = [
      ...articles.map((article) => ({
        id: article.id as string,
        type: 'article' as const,
        title: article.title,
        excerpt: article.excerpt,
        thumbnailUrl: article.articleImageUrl,
        href: `/article/${article.slug}`,
        createdAt: (article.publishedAt ?? article.createdAt).toISOString(),
      })),
      ...videos.map((video) => ({
        id: video.id as string,
        type: 'video' as const,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        href: `/videos/${video.id}`,
        createdAt: (video.publishedAt ?? video.createdAt).toISOString(),
      })),
      ...comments.map((comment) => {
        const article = comment.article as unknown as { slug?: string } | null
        return {
          id: comment.id as string,
          type: 'comment' as const,
          title: comment.content,
          href: article?.slug ? `/article/${article.slug}` : '#',
          createdAt: comment.createdAt.toISOString(),
        }
      }),
    ]

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return items
  },

  // Reader public-profile "Library" tab: articles/videos actually read or
  // watched, most-recent-first — distinct from likes.
  async getReadWatchHistory(targetId: string): Promise<LibraryItem[]> {
    const user = await userRepository.findHistoryById(targetId)
    if (!user) return []

    const items: LibraryItem[] = []

    for (const entry of user.readingHistory) {
      const article = entry.article as unknown as {
        _id: unknown
        title: string
        slug: string
        excerpt?: string
        articleImageUrl?: string
        status: string
      } | null
      if (!article || article.status !== 'published') continue
      items.push({
        id: String(article._id),
        type: 'article',
        title: article.title,
        excerpt: article.excerpt,
        thumbnailUrl: article.articleImageUrl,
        href: `/article/${article.slug}`,
        createdAt: entry.readAt.toISOString(),
      })
    }

    for (const entry of user.watchHistory) {
      const video = entry.video as unknown as {
        _id: unknown
        title: string
        thumbnailUrl?: string
        status: string
        visibility: string
      } | null
      if (!video || video.status !== 'published' || video.visibility !== 'public') continue
      items.push({
        id: String(video._id),
        type: 'video',
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        href: `/videos/${String(video._id)}`,
        createdAt: entry.watchedAt.toISOString(),
      })
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return items
  },

  async changeOwnEmail(userId: string, newEmail: string, currentPassword: string) {
    const user = await userRepository.findByIdWithSecrets(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash)
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect.', 401)
    }

    if (newEmail === user.email) {
      throw new AppError('That is already your current email address.', 400)
    }

    await assertDeliverableEmail(newEmail)

    const existing = await userRepository.findByEmail(newEmail)
    if (existing) {
      throw new AppError('An account with that email already exists.', 409)
    }

    await userRepository.updateEmail(userId, newEmail)
    const updatedUser = await userRepository.findById(userId)
    if (!updatedUser) {
      throw new AppError('Account not found.', 404)
    }

    await issueAndSendVerificationEmail(updatedUser)
    return updatedUser
  },

  async changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findByIdWithSecrets(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash)
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect.', 401)
    }

    const passwordHash = await hashPassword(newPassword)
    await userRepository.updatePasswordHash(userId, passwordHash)
  },

  async deleteOwnAccount(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }

    if (user.role === ROLES.ADMIN) {
      const remainingAdmins = await userRepository.countAdmins(userId)
      if (remainingAdmins === 0) {
        throw new AppError(
          'You are the last admin account. Promote another admin before deleting your own account.',
          400,
        )
      }
    }

    await userRepository.deleteById(userId)
  },

  // No SMS provider is configured yet, so (like the mail service's
  // jsonTransport fallback) the code is just logged server-side for dev/demo
  // purposes instead of actually being texted.
  async sendPhoneVerificationCode(userId: string, phone: string) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }

    const { code, codeHash } = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    await userRepository.setPhoneVerificationCode(userId, phone, codeHash, expiresAt)

    logger.info(`Phone verification code for ${phone}: ${code} (no SMS provider configured)`)
  },

  async verifyPhoneCode(userId: string, code: string) {
    const user = await userRepository.findByIdWithPhoneSecrets(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }

    if (!user.phoneVerificationCodeHash || !user.phoneVerificationExpires) {
      throw new AppError('No verification code was requested. Please request a new code.', 400)
    }

    if (user.phoneVerificationExpires.getTime() < Date.now()) {
      throw new AppError('This verification code has expired. Please request a new code.', 400)
    }

    if (hashToken(code) !== user.phoneVerificationCodeHash) {
      throw new AppError('That verification code is incorrect.', 400)
    }

    await userRepository.markPhoneVerified(userId)
    const updatedUser = await userRepository.findById(userId)
    if (!updatedUser) {
      throw new AppError('Account not found.', 404)
    }
    return updatedUser
  },

  // Self-service reader -> author upgrade. Readers can only apply once they've
  // verified both their email and phone; approval is instant (no editor review
  // queue) since the Truth Protocol acceptance + verified contact info is the
  // gate, not manual moderation.
  async becomeAuthor(userId: string, input: BecomeAuthorInput) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }

    if (user.role !== ROLES.READER) {
      throw new AppError('Only reader accounts can apply to become an author.', 400)
    }

    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email address before becoming an author.', 400)
    }

    if (!user.isPhoneVerified) {
      throw new AppError('Please verify your phone number before becoming an author.', 400)
    }

    assertProfileComplete(user, input)

    await userRepository.completeAuthorOnboarding(userId, {
      fullName: input.fullName,
      profilePhotoUrl: input.profilePhotoUrl,
      shortBio: input.shortBio,
      socialLinks: input.socialLinks,
    })

    const updatedUser = await userRepository.findById(userId)
    if (!updatedUser) {
      throw new AppError('Account not found.', 404)
    }
    return updatedUser
  },

  // Self-service reader -> editor upgrade. Mirrors becomeAuthor exactly:
  // instant approval once email/phone are verified and the editorial
  // standards agreement is accepted, no manual review queue.
  async becomeEditor(userId: string, input: BecomeEditorInput) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('Account not found.', 404)
    }

    if (user.role !== ROLES.READER) {
      throw new AppError('Only reader accounts can apply to become an editor.', 400)
    }

    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email address before becoming an editor.', 400)
    }

    if (!user.isPhoneVerified) {
      throw new AppError('Please verify your phone number before becoming an editor.', 400)
    }

    assertProfileComplete(user, input)

    await userRepository.completeEditorOnboarding(userId, {
      fullName: input.fullName,
      profilePhotoUrl: input.profilePhotoUrl,
      shortBio: input.shortBio,
      socialLinks: input.socialLinks,
    })

    const updatedUser = await userRepository.findById(userId)
    if (!updatedUser) {
      throw new AppError('Account not found.', 404)
    }
    return updatedUser
  },
}
