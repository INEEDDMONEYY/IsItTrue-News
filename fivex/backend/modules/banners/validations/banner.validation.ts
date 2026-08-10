import { z } from 'zod'
import { BANNER_TONES } from '../models/Banner.js'

export const createBannerSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(300, 'Message is too long'),
  tone: z.enum(BANNER_TONES).default('info'),
})

export type CreateBannerInput = z.infer<typeof createBannerSchema>
