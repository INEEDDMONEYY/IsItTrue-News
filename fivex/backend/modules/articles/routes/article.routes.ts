import { Router } from 'express'
import { authenticate, optionalAuthenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { articleController } from '../controllers/article.controller.js'
import {
  createArticleSchema,
  requestChangesSchema,
  toggleRequirementSchema,
  updateArticleSchema,
  updateArticleStatusSchema,
  updateEditorialWorkflowSchema,
} from '../validations/article.validation.js'

const router = Router()

// Public: reader-facing feed of published articles.
router.get('/', articleController.listPublished)

// Author/admin: the signed-in author's own articles (any status). Declared
// before "/:id" so "mine"/"pending"/"all" are never swallowed by the param route.
router.get('/mine', authenticate, authorize(ROLES.AUTHOR, ROLES.ADMIN), articleController.listMine)

// Editor/admin: review queue of articles awaiting a publish decision.
router.get(
  '/pending',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  articleController.listPending,
)

router.get(
  '/editorial-workflow',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  articleController.listEditorialWorkflow,
)

// Editor/admin: drafts sent back to authors and still awaiting their changes.
router.get(
  '/changes-requested',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  articleController.listChangesRequested,
)

// Admin-only: every article regardless of status/author.
router.get('/all', authenticate, authorize(ROLES.ADMIN), articleController.listAll)

// Public: the most-liked published article, promoted to the homepage
// featured slot. Declared before "/:id" for the same reason as above.
router.get('/featured', articleController.getFeatured)

// Public: published articles for a given category/tag page, looked up by
// slug. Declared before "/:id" for the same reason as above.
router.get('/category/:slug', articleController.listByCategory)
router.get('/tag/:slug', articleController.listByTag)

// Public: a given author's published articles, for their public profile page.
router.get('/author/:id', articleController.listByAuthor)

// Public: a given reader's liked articles, for their public profile page.
router.get('/liked/:id', articleController.listLiked)

// Public-ish: same visibility rules as "/:id" but looked up by slug, since
// reader-facing URLs use the article's slug rather than its Mongo id.
router.get('/slug/:slug', optionalAuthenticate, articleController.getBySlug)

router.post(
  '/',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.ADMIN),
  validate(createArticleSchema),
  articleController.create,
)

// Public-ish: published articles are visible to anyone; drafts/pending are
// only visible to their owner or an editor/admin (enforced in the service).
router.get('/:id', optionalAuthenticate, articleController.getById)

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  validate(updateArticleSchema),
  articleController.update,
)

router.patch(
  '/:id/status',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  validate(updateArticleStatusSchema),
  articleController.updateStatus,
)

router.patch(
  '/:id/editorial-workflow',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  validate(updateEditorialWorkflowSchema),
  articleController.updateEditorialWorkflow,
)

router.post('/:id/view', optionalAuthenticate, articleController.recordView)

// Editor/admin: the editorial decision on an article awaiting review.
router.post('/:id/approve', authenticate, authorize(ROLES.EDITOR, ROLES.ADMIN), articleController.approve)
router.post(
  '/:id/request-changes',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  validate(requestChangesSchema),
  articleController.requestChanges,
)

// Author: tick a requirement off (or back on) while working through an editor's feedback.
router.patch(
  '/:id/requirements/:requirementId',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.ADMIN),
  validate(toggleRequirementSchema),
  articleController.setRequirementDone,
)

// Any authenticated reader can like/unlike a published article.
router.post('/:id/like', authenticate, articleController.toggleLike)

// Any authenticated reader can dislike/un-dislike a published article.
router.post('/:id/dislike', authenticate, articleController.toggleDislike)

// Anyone can share an article; this just increments a counter, no auth needed.
router.post('/:id/share', articleController.share)

// Any authenticated reader (reader, author, or editor) can bookmark/unbookmark
// a published article.
router.post('/:id/bookmark', authenticate, articleController.toggleBookmark)

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  articleController.remove,
)

export const articleRoutes = router
