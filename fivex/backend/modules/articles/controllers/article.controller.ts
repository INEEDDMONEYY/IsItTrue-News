import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { truncateToParagraphs } from '../../../utils/htmlPreview.js'
import { articleService } from '../services/article.service.js'
import type {
  CreateArticleInput,
  UpdateArticleInput,
  UpdateArticleStatusInput,
} from '../validations/article.validation.js'

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError('You must be signed in to access this resource.', 401)
  }
  return req.user
}

// Locked readers (anonymous viewers, or free-plan readers past their monthly
// unlock cap) get a short preview of the body instead of the full article —
// headline/excerpt/author/comments stay unlimited (see articleService's
// resolveArticleLock for the actual gating decision).
function serializeArticle(article: Awaited<ReturnType<typeof articleService.getArticleById>>['article'], locked: boolean) {
  const json = article.toJSON() as Record<string, unknown>
  if (locked) {
    json.body = truncateToParagraphs(json.body as string, 2)
  }
  return { ...json, locked }
}

export const articleController = {
  // Public: the reader-facing feed only ever shows published articles.
  listPublished: asyncHandler(async (_req: Request, res: Response) => {
    const articles = await articleService.listPublished()
    res.status(200).json({ articles })
  }),

  // Public: published articles in a given category, for the category page.
  listByCategory: asyncHandler(async (req: Request, res: Response) => {
    const articles = await articleService.listPublishedByCategory(req.params.slug)
    res.status(200).json({ articles })
  }),

  // Public: published articles carrying a given tag, for the tag page.
  listByTag: asyncHandler(async (req: Request, res: Response) => {
    const articles = await articleService.listPublishedByTag(req.params.slug)
    res.status(200).json({ articles })
  }),

  // Public: a given author's published articles, for their public profile page.
  listByAuthor: asyncHandler(async (req: Request, res: Response) => {
    const articles = await articleService.listPublishedByAuthor(req.params.id)
    res.status(200).json({ articles })
  }),

  // Public: a given reader's liked articles, for their public profile page.
  listLiked: asyncHandler(async (req: Request, res: Response) => {
    const articles = await articleService.listLikedByUser(req.params.id)
    res.status(200).json({ articles })
  }),

  // Author/admin: the signed-in author's own articles, any status.
  listMine: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const articles = await articleService.listOwnArticles(user.id)
    res.status(200).json({ articles })
  }),

  // Editor/admin: the review queue of articles awaiting a publish decision.
  listPending: asyncHandler(async (_req: Request, res: Response) => {
    const articles = await articleService.listPendingReview()
    res.status(200).json({ articles })
  }),

  // Admin-only: every article regardless of status or author.
  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const articles = await articleService.listAll()
    res.status(200).json({ articles })
  }),

  // Public: the article with the most likes gets promoted to the homepage
  // featured slot.
  getFeatured: asyncHandler(async (_req: Request, res: Response) => {
    const article = await articleService.getFeatured()
    res.status(200).json({ article })
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const { article, locked } = await articleService.getArticleBySlug(req.params.slug, req.user)
    const liked = req.user ? article.likedBy.some((id) => id.toString() === req.user!.id) : false
    const disliked = req.user
      ? article.dislikedBy.some((id) => id.toString() === req.user!.id)
      : false
    const bookmarked = req.user
      ? article.bookmarkedBy.some((entry) => entry.user.toString() === req.user!.id)
      : false
    res.status(200).json({ article: serializeArticle(article, locked), liked, disliked, bookmarked })
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { article, locked } = await articleService.getArticleById(req.params.id, req.user)
    res.status(200).json({ article: serializeArticle(article, locked) })
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const input = req.body as CreateArticleInput
    const article = await articleService.createArticle(user.id, input)
    res.status(201).json({ message: 'Article created successfully.', article })
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const input = req.body as UpdateArticleInput
    await articleService.updateArticle(req.params.id, user, input)
    res.status(200).json({ message: 'Article updated successfully.' })
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const { status } = req.body as UpdateArticleStatusInput
    await articleService.updateStatus(req.params.id, status, user)
    res.status(200).json({ message: 'Article status updated successfully.' })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    await articleService.deleteArticle(req.params.id, user)
    res.status(200).json({ message: 'Article deleted successfully.' })
  }),

  recordView: asyncHandler(async (req: Request, res: Response) => {
    await articleService.recordView(req.params.id, req.user?.id)
    res.status(204).send()
  }),

  toggleLike: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const result = await articleService.toggleLike(req.params.id, user.id)
    res.status(200).json(result)
  }),

  toggleDislike: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const result = await articleService.toggleDislike(req.params.id, user.id)
    res.status(200).json(result)
  }),

  share: asyncHandler(async (req: Request, res: Response) => {
    const sharesCount = await articleService.incrementShare(req.params.id)
    res.status(200).json({ sharesCount })
  }),

  toggleBookmark: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req)
    const result = await articleService.toggleBookmark(req.params.id, user.id)
    res.status(200).json(result)
  }),
}
