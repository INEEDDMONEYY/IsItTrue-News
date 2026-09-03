import { z } from 'zod'
import { VIDEO_STATUSES, VIDEO_VISIBILITIES } from '../constants/videoStatus.js'

export const createVideoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().trim().max(2000, 'Description is too long').default(''),
  category: z.string().trim().min(1, 'Category is required'),
  tags: z.array(z.string().trim().min(1).max(30)).max(15).optional().default([]),
  // Authors don't route through an editorial review status: a new video is
  // either kept as a private draft or published immediately.
  status: z.enum([VIDEO_STATUSES.DRAFT, VIDEO_STATUSES.PUBLISHED]),
  visibility: z.enum(VIDEO_VISIBILITIES).optional(),
  videoUrl: z.string().trim().url('A valid uploaded video URL is required'),
  thumbnailUrl: z.string().trim().url().optional(),
  duration: z.number().min(0).optional(),
})

export type CreateVideoInput = z.infer<typeof createVideoSchema>

export const updateVideoSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().min(1).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(15).optional(),
  visibility: z.enum(VIDEO_VISIBILITIES).optional(),
  videoUrl: z.string().trim().url().optional(),
  thumbnailUrl: z.string().trim().url().optional(),
  duration: z.number().min(0).optional(),
})

export type UpdateVideoInput = z.infer<typeof updateVideoSchema>

export const updateVideoStatusSchema = z.object({
  status: z.enum([VIDEO_STATUSES.DRAFT, VIDEO_STATUSES.PUBLISHED]),
})

export type UpdateVideoStatusInput = z.infer<typeof updateVideoStatusSchema>
