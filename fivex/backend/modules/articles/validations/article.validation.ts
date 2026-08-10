import { z } from 'zod'
import { ARTICLE_STATUSES } from '../constants/articleStatus.js'

const urlListSchema = z.array(z.string().trim().url()).max(10).optional()

const tagListSchema = z.array(z.string().trim().min(1).max(30)).max(15).optional().default([])

export const createArticleSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  excerpt: z.string().trim().max(400, 'Excerpt is too long').default(''),
  body: z.string().default(''),
  category: z.string().trim().min(1, 'Category is required'),
  // Authors no longer route through an editorial review status: a new
  // article is either kept as a private draft or published immediately.
  status: z.enum([ARTICLE_STATUSES.DRAFT, ARTICLE_STATUSES.PUBLISHED]),
  tags: tagListSchema,
  articleImageUrl: z.string().trim().url().optional(),
  articleVideoUrl: z.string().trim().url().optional(),
  videoThumbnailUrl: z.string().trim().url().optional(),
  socialLinks: urlListSchema,
  sourceLinks: urlListSchema,
})

export type CreateArticleInput = z.infer<typeof createArticleSchema>

export const updateArticleSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  excerpt: z.string().trim().max(400).optional(),
  body: z.string().optional(),
  category: z.string().trim().min(1).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(15).optional(),
  articleImageUrl: z.string().trim().url().optional(),
  articleVideoUrl: z.string().trim().url().optional(),
  videoThumbnailUrl: z.string().trim().url().optional(),
  socialLinks: urlListSchema,
  sourceLinks: urlListSchema,
})

export type UpdateArticleInput = z.infer<typeof updateArticleSchema>

export const updateArticleStatusSchema = z.object({
  status: z.enum([ARTICLE_STATUSES.DRAFT, ARTICLE_STATUSES.PENDING_REVIEW, ARTICLE_STATUSES.PUBLISHED]),
})

export type UpdateArticleStatusInput = z.infer<typeof updateArticleStatusSchema>
