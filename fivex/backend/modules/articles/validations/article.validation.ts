import { z } from 'zod'
import { ARTICLE_STATUSES } from '../constants/articleStatus.js'
import { ARTICLE_EDITORIAL_STAGES } from '../constants/editorialWorkflow.js'

// Same ceiling the request parser enforces (see middleware/articleBodyParser.ts), stated as a readable error.
const MAX_BODY_CHARACTERS = 200_000
const bodySchema = z.string().max(MAX_BODY_CHARACTERS, 'This article is too long. Shorten it and upload images instead of pasting them in.')

const urlListSchema = z.array(z.string().trim().url()).max(10).optional()

const tagListSchema = z.array(z.string().trim().min(1).max(30)).max(15).optional().default([])

export const createArticleSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  excerpt: z.string().trim().max(400, 'Excerpt is too long').default(''),
  body: bodySchema.default(''),
  category: z.string().trim().min(1, 'Category is required'),
  // Authors can save a draft or submit for editorial review. "published" is
  // still accepted so editors/admins can publish directly; for authors the
  // service downgrades it to pending_review.
  status: z.enum([ARTICLE_STATUSES.DRAFT, ARTICLE_STATUSES.PENDING_REVIEW, ARTICLE_STATUSES.PUBLISHED]),
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
  body: bodySchema.optional(),
  category: z.string().trim().min(1).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(15).optional(),
  // null removes the media from the article; leaving the field out keeps it.
  articleImageUrl: z.string().trim().url().nullable().optional(),
  articleVideoUrl: z.string().trim().url().nullable().optional(),
  videoThumbnailUrl: z.string().trim().url().nullable().optional(),
  socialLinks: urlListSchema,
  sourceLinks: urlListSchema,
})

export type UpdateArticleInput = z.infer<typeof updateArticleSchema>

export const updateArticleStatusSchema = z.object({
  status: z.enum([ARTICLE_STATUSES.DRAFT, ARTICLE_STATUSES.PENDING_REVIEW, ARTICLE_STATUSES.PUBLISHED]),
})

export type UpdateArticleStatusInput = z.infer<typeof updateArticleStatusSchema>

// An editor sends an article back with a checklist of required changes and/or a note.
export const requestChangesSchema = z
  .object({
    requirements: z
      .array(z.string().trim().min(1, 'Requirements cannot be empty').max(300, 'Requirement is too long'))
      .max(20, 'Add at most 20 requirements')
      .default([]),
    note: z.string().trim().max(500, 'Note is too long').optional(),
  })
  .refine((data) => data.requirements.length > 0 || Boolean(data.note), {
    message: 'Add at least one requirement or a note for the author',
    path: ['requirements'],
  })

export type RequestChangesInput = z.infer<typeof requestChangesSchema>

export const toggleRequirementSchema = z.object({
  done: z.boolean(),
})

export type ToggleRequirementInput = z.infer<typeof toggleRequirementSchema>

export const updateEditorialWorkflowSchema = z.object({
  editorialStage: z.enum(ARTICLE_EDITORIAL_STAGES),
  editorialDeadline: z.string().date().nullable(),
})

export type UpdateEditorialWorkflowInput = z.infer<typeof updateEditorialWorkflowSchema>
