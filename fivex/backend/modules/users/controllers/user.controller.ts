import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { clearAuthCookies } from '../../../utils/cookies.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { userService } from '../services/user.service.js'
import type {
  ChangeEmailInput,
  ChangePasswordInput,
  CreateUserInput,
  UpdateNameInput,
  UpdateRoleInput,
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
}
