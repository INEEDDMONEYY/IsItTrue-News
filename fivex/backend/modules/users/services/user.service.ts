import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { assertDeliverableEmail } from '../../../security/emailValidator.js'
import { comparePassword, hashPassword } from '../../../utils/password.js'
import { issueAndSendVerificationEmail } from '../../auth/services/emailVerification.service.js'
import { userRepository } from '../repositories/user.repository.js'

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
}
