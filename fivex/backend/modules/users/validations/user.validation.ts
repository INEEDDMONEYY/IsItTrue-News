import { z } from 'zod'
import { ROLES } from '../../../shared/constants/roles.js'
import { passwordSchema } from '../../auth/validations/auth.validation.js'

const roleSchema = z.enum([ROLES.READER, ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN])

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  password: passwordSchema,
  role: roleSchema,
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateRoleSchema = z.object({
  role: roleSchema,
})

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>

export const updateNameSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
})

export type UpdateNameInput = z.infer<typeof updateNameSchema>

export const changeEmailSchema = z.object({
  newEmail: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  currentPassword: z.string().min(1, 'Current password is required'),
})

export type ChangeEmailInput = z.infer<typeof changeEmailSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
