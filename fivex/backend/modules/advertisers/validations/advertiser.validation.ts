import { z } from 'zod'
import { passwordSchema } from '../../auth/validations/auth.validation.js'
import { AD_TARGET_PAGES, ALL_CAMPAIGN_PLACEMENTS, type CampaignPlacement } from '../constants/advertiser.js'
import { BUNDLES, MAX_NEWSLETTER_SENDS, type BundleDefinition } from '../constants/pricing.js'

type BundleId = BundleDefinition['id']

export const registerAdvertiserSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(120, 'Business name is too long'),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address').max(254),
  // Same strength rules as every other account on the platform.
  password: passwordSchema,
})

export type RegisterAdvertiserInput = z.infer<typeof registerAdvertiserSchema>

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

// Only http(s): a javascript: or data: URL must never end up behind an ad's click.
const httpUrlSchema = z
  .string()
  .trim()
  .max(2048, 'URL is too long')
  .url('Please enter a full URL, e.g. https://example.com')
  .refine((url) => /^https?:\/\//i.test(url), 'URL must start with http:// or https://')

const optionalHttpUrl = z.union([z.literal(''), httpUrlSchema]).default('')

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Dates must be in YYYY-MM-DD format')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'Invalid date')

const creativeTextSchema = z.object({
  headline: z.string().trim().max(80, 'Headline must be 80 characters or fewer').default(''),
  body: z.string().trim().max(200, 'Body text must be 200 characters or fewer').default(''),
  ctaLabel: z.string().trim().max(24, 'Button label must be 24 characters or fewer').default('Learn more'),
  destinationUrl: optionalHttpUrl,
})

const creativeInputSchema = creativeTextSchema
  .extend({ imageAssetId: objectIdSchema.nullable().default(null) })
  .default({})

const targetPagesSchema = z
  .array(z.enum(AD_TARGET_PAGES))
  .max(AD_TARGET_PAGES.length)
  .default([])
  .transform((pages) => [...new Set(pages)])

// Category slugs. The service checks each one exists before saving.
const targetCategoriesSchema = z
  .array(z.string().trim().min(1).max(80))
  .max(100)
  .default([])
  .transform((slugs) => [...new Set(slugs)])

const durationSchema = z.union([z.literal(7), z.literal(30)])
const sendsSchema = z.number().int().min(1, 'Choose at least one send').max(MAX_NEWSLETTER_SENDS, 'Too many sends')

// Drafts may be incomplete, so only shape and length are checked here; what a submission needs is checked by
// the campaign service, which knows the placement's requirements. Prices are set by the server, never the client.
export const campaignInputSchema = z.object({
  name: z.string().trim().min(1, 'Campaign name is required').max(120, 'Campaign name is too long'),
  placement: z.enum(ALL_CAMPAIGN_PLACEMENTS as [CampaignPlacement, ...CampaignPlacement[]]),
  creative: creativeInputSchema,
  targetPages: targetPagesSchema,
  targetCategories: targetCategoriesSchema,
  durationDays: durationSchema.default(30),
  sends: sendsSchema.default(1),
  startDate: isoDateSchema.nullable().default(null),
  // false saves a draft; true submits it for review.
  submit: z.boolean().default(false),
})

export type CampaignInput = z.infer<typeof campaignInputSchema>

// A bundle needs its own image for each placement, since every placement has a different size.
export const bundleInputSchema = z.object({
  bundleId: z.enum(BUNDLES.map((bundle) => bundle.id) as [BundleId, ...BundleId[]]),
  name: z.string().trim().min(1, 'Campaign name is required').max(120, 'Campaign name is too long'),
  creative: creativeTextSchema.default({}),
  images: z.record(z.enum(ALL_CAMPAIGN_PLACEMENTS as [CampaignPlacement, ...CampaignPlacement[]]), objectIdSchema.nullable()).default({}),
  targetPages: targetPagesSchema,
  targetCategories: targetCategoriesSchema,
  startDate: isoDateSchema.nullable().default(null),
  submit: z.boolean().default(false),
})

export type BundleInput = z.infer<typeof bundleInputSchema>

// Editing changes only the name and the creative. Placement, dates, duration, targets, and budget were paid for.
export const campaignEditInputSchema = z.object({
  name: z.string().trim().min(1, 'Campaign name is required').max(120, 'Campaign name is too long'),
  creative: creativeInputSchema,
  submit: z.boolean().default(false),
})

export type CampaignEditInput = z.infer<typeof campaignEditInputSchema>

export const renameAssetSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
})

const addressSchema = z.object({
  line1: z.string().trim().max(200).default(''),
  line2: z.string().trim().max(200).default(''),
  city: z.string().trim().max(100).default(''),
  region: z.string().trim().max(100).default(''),
  postalCode: z.string().trim().max(20).default(''),
  country: z.string().trim().max(100).default(''),
})

export const updateProfileSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(120, 'Business name is too long'),
  contactName: z.string().trim().max(120).default(''),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[\d\s()+.-]*$/, 'Phone may only contain digits, spaces and + ( ) . -')
    .default(''),
  website: optionalHttpUrl,
  industry: z.string().trim().max(80).default(''),
  description: z.string().trim().max(1000, 'Description must be 1000 characters or fewer').default(''),
  billingEmail: z
    .union([z.literal(''), z.string().trim().toLowerCase().email('Please provide a valid billing email').max(254)])
    .default(''),
  address: addressSchema.default({}),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const updateNotificationsSchema = z.object({
  campaignStatus: z.boolean(),
  weeklyReport: z.boolean(),
  billing: z.boolean(),
})

export type UpdateNotificationsInput = z.infer<typeof updateNotificationsSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(128),
    newPassword: passwordSchema,
  })
  .refine((input) => input.currentPassword !== input.newPassword, {
    message: 'New password must be different from the current one',
    path: ['newPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
