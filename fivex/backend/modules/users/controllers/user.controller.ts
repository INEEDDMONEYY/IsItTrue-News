import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { clearAuthCookies } from '../../../utils/cookies.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { userService } from '../services/user.service.js'
import type {
  BecomeAuthorInput,
  ChangeEmailInput,
  ChangePasswordInput,
  CreateUserInput,
  SendPhoneCodeInput,
  UpdateAuthorProfileInput,
  UpdateNameInput,
  UpdateReaderProfileInput,
  UpdateRoleInput,
  VerifyPhoneCodeInput,
} from '../validations/user.validation.js'

export const userController = {
  // Admin-only: list every registered account. Gated by authenticate + authorize
  // in the route definition, so a non-admin can never reach this handler.
  list: asyncHandler(async (_req: Request, res: Response) => {
    const users = await userService.listUsers()
    res.status(200).json({ users })
  }),

  // Admin-only: create a new account with an explicit role (e.g. another admin).
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateUserInput
    const user = await userService.createUser(input)
    res.status(201).json({ message: 'User created successfully.', user })
  }),

  // Admin-only: promote/demote an existing account.
  updateRole: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const { role } = req.body as UpdateRoleInput
    await userService.updateRole(req.params.id, role, req.user.id)
    res.status(200).json({ message: 'Role updated successfully.' })
  }),

  // Admin-only: permanently remove another account.
  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    await userService.deleteUser(req.params.id, req.user.id)
    res.status(200).json({ message: 'User deleted successfully.' })
  }),

  // Any signed-in user: update their own display name.
  updateOwnName: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const { name } = req.body as UpdateNameInput
    const user = await userService.updateOwnName(req.user.id, name)
    res.status(200).json({ message: 'Name updated successfully.', user })
  }),

  // Any signed-in user: update their author dashboard profile (bio, expertise,
  // publishing defaults, notification preferences).
  updateOwnAuthorProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const updates = req.body as UpdateAuthorProfileInput
    const user = await userService.updateOwnAuthorProfile(req.user.id, updates)
    res.status(200).json({ message: 'Author profile updated successfully.', user })
  }),

  // Any signed-in user: update their reader dashboard profile (reading
  // experience settings, content preferences).
  updateOwnReaderProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const updates = req.body as UpdateReaderProfileInput
    const user = await userService.updateOwnReaderProfile(req.user.id, updates)
    res.status(200).json({ message: 'Reading preferences updated successfully.', user })
  }),

  // Any signed-in user: their free-plan usage (articles/videos consumed this
  // month) that drives the reader sidebar's usage tracker.
  getOwnUsage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const usage = await userService.getOwnUsage(req.user.id)
    res.status(200).json({ usage })
  }),

  // Public: anyone (signed in or not) can view an author's public profile.
  getPublicProfile: asyncHandler(async (req: Request, res: Response) => {
    const { user, isFollowing, stats } = await userService.getPublicProfile(
      req.params.id,
      req.user?.id,
    )
    res.status(200).json({ user, isFollowing, stats })
  }),

  // Any signed-in user: follow/unfollow another author.
  toggleFollow: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const result = await userService.toggleFollow(req.params.id, req.user.id)
    res.status(200).json(result)
  }),

  // Public: every article/video/comment the target user has liked.
  getLibrary: asyncHandler(async (req: Request, res: Response) => {
    const items = await userService.getLibrary(req.params.id)
    res.status(200).json({ items })
  }),

  // Any signed-in user: change their own password.
  changeOwnPassword: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const { currentPassword, newPassword } = req.body as ChangePasswordInput
    await userService.changeOwnPassword(req.user.id, currentPassword, newPassword)
    res.status(200).json({ message: 'Password updated successfully.' })
  }),

  // Any signed-in user: change their own email. Re-marks the account unverified
  // and sends a fresh verification email to the new address.
  changeOwnEmail: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const { newEmail, currentPassword } = req.body as ChangeEmailInput
    const user = await userService.changeOwnEmail(req.user.id, newEmail, currentPassword)
    res.status(200).json({
      message: 'Email updated. Please check your new inbox to verify it.',
      user,
    })
  }),

  // Any signed-in user: permanently delete their own account.
  deleteOwnAccount: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    await userService.deleteOwnAccount(req.user.id)
    clearAuthCookies(res)
    res.status(200).json({ message: 'Account deleted successfully.' })
  }),

  // Any signed-in user: request a verification code for a phone number
  // ("Become an Author" onboarding step).
  sendPhoneVerificationCode: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const { phone } = req.body as SendPhoneCodeInput
    await userService.sendPhoneVerificationCode(req.user.id, phone)
    res.status(200).json({ message: 'Verification code sent.' })
  }),

  // Any signed-in user: confirm the code sent to their phone number.
  verifyPhoneCode: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const { code } = req.body as VerifyPhoneCodeInput
    const user = await userService.verifyPhoneCode(req.user.id, code)
    res.status(200).json({ message: 'Phone number verified successfully.', user })
  }),

  // Reader-only: complete "Become an Author" onboarding, flipping the account
  // to the author role once email/phone are verified and the Truth Protocol
  // has been accepted.
  becomeAuthor: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('You must be signed in to access this resource.', 401)
    }
    const input = req.body as BecomeAuthorInput
    const user = await userService.becomeAuthor(req.user.id, input)
    res.status(200).json({ message: 'Congratulations — your account is now an author account!', user })
  }),
}
