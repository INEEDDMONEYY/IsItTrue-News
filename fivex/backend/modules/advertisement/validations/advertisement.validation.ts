import { z } from 'zod'

// Admins can only switch an advertiser between active and suspended. Pending comes from the sign-up flow.
export const advertiserStatusSchema = z.object({
  status: z.enum(['active', 'suspended']),
})

export const rejectCampaignSchema = z.object({
  reviewNote: z.string().trim().min(3, 'Give a short reason for the rejection.').max(500),
})

export type AdvertiserStatusInput = z.infer<typeof advertiserStatusSchema>
export type RejectCampaignInput = z.infer<typeof rejectCampaignSchema>
