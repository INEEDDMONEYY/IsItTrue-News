import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { tagService } from '../services/tag.service.js'
import type { CreateTagInput, UpdateTagInput } from '../validations/tag.validation.js'

export const tagController = {
  // Public: anyone (including signed-out readers) can see the tag list, it's
  // needed to render tag filters/pages on the public site.
  list: asyncHandler(async (_req: Request, res: Response) => {
    const tags = await tagService.listTags()
    res.status(200).json({ tags })
  }),

  // Author/editor/admin: create a tag on the fly (e.g. while writing an
  // article). Returns the existing tag if the name/slug already exists.
  create: asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body as CreateTagInput
    const tag = await tagService.createTag(name)
    res.status(201).json({ message: 'Tag created successfully.', tag })
  }),

  // Admin-only: rename an existing tag.
  update: asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body as UpdateTagInput
    await tagService.updateTag(req.params.id, name)
    res.status(200).json({ message: 'Tag updated successfully.' })
  }),

  // Admin-only: remove a tag.
  remove: asyncHandler(async (req: Request, res: Response) => {
    await tagService.deleteTag(req.params.id)
    res.status(200).json({ message: 'Tag deleted successfully.' })
  }),
}
