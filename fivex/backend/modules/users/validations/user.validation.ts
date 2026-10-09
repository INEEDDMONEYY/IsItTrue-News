import { z } from 'zod'
import { ROLES } from '../../../shared/constants/roles.js'
import { passwordSchema } from '../../auth/validations/auth.validation.js'

const roleSchema = z.enum([
  ROLES.READER,
  ROLES.AUTHOR,
  ROLES.EDITOR,
  ROLES.ORGANIZATION,
  ROLES.CONTRIBUTOR,
  ROLES.ADMIN,
])

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

const socialLinksSchema = z
  .object({
    twitter: z.string().trim().max(200).optional(),
    linkedin: z.string().trim().max(200).optional(),
    instagram: z.string().trim().max(200).optional(),
  })
  .optional()

export const updateAuthorProfileSchema = z.object({
  professionalName: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(1000).optional(),
  location: z.string().trim().max(120).optional(),
  website: z.string().trim().max(300).optional(),
  profileImage: z.string().trim().max(500).optional(),
  bannerImage: z.string().trim().max(500).optional(),
  socialLinks: socialLinksSchema,
  primaryBeats: z.array(z.string().trim()).optional(),
  secondaryBeats: z.array(z.string().trim()).optional(),
  areasOfExpertise: z.array(z.string().trim()).optional(),
  geographicCoverage: z.array(z.string().trim()).optional(),
  languages: z.array(z.string().trim()).optional(),
  yearsOfExperience: z.number().min(0).max(80).optional(),
  defaultCategory: z.string().trim().max(80).optional(),
  defaultVisibility: z.enum(['draft', 'editorial-review']).optional(),
  factCheckingEnabled: z.boolean().optional(),
  sourceAttributionEnabled: z.boolean().optional(),
  allowEditorialSuggestions: z.boolean().optional(),
  editorialUpdates: z.boolean().optional(),
  assignmentNotifications: z.boolean().optional(),
  revisionNotifications: z.boolean().optional(),
  collaborationNotifications: z.boolean().optional(),
  investigationNotifications: z.boolean().optional(),
})

export type UpdateAuthorProfileInput = z.infer<typeof updateAuthorProfileSchema>

export const updateReaderProfileSchema = z.object({
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
  theme: z.enum(['light', 'dark', 'sepia']).optional(),
  distractionFreeMode: z.boolean().optional(),
  autoSaveProgress: z.boolean().optional(),
  showEstimatedReadingTime: z.boolean().optional(),
  summariesFirst: z.boolean().optional(),
  topics: z.array(z.string().trim()).optional(),
  regions: z.array(z.string().trim()).optional(),
  formats: z.array(z.string().trim()).optional(),
  depth: z.enum(['quick-summaries', 'full-investigative']).optional(),
})

export type UpdateReaderProfileInput = z.infer<typeof updateReaderProfileSchema>

export const sendPhoneCodeSchema = z.object({
  phone: z.string().trim().min(7, 'Please provide a valid phone number').max(20),
})

export type SendPhoneCodeInput = z.infer<typeof sendPhoneCodeSchema>

export const verifyPhoneCodeSchema = z.object({
  code: z.string().trim().length(6, 'The verification code must be 6 digits'),
})

export type VerifyPhoneCodeInput = z.infer<typeof verifyPhoneCodeSchema>

export const becomeAuthorSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80),
  // Optional: omitted when the user already saved these in their settings.
  profilePhotoUrl: z.string().trim().min(1).max(500).optional(),
  shortBio: z.string().trim().min(1).max(1000).optional(),
  socialLinks: socialLinksSchema,
  acceptTruthProtocol: z
    .boolean()
    .refine((value) => value === true, 'You must accept the Truth Protocol to become an author'),
})

export type BecomeAuthorInput = z.infer<typeof becomeAuthorSchema>

export const becomeEditorSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80),
  profilePhotoUrl: z.string().trim().min(1).max(500).optional(),
  shortBio: z.string().trim().min(1).max(1000).optional(),
  socialLinks: socialLinksSchema,
  acceptEditorialStandards: z
    .boolean()
    .refine((value) => value === true, 'You must accept the editorial standards to become an editor'),
})

export type BecomeEditorInput = z.infer<typeof becomeEditorSchema>
