import { Router } from 'express'
import { authenticate, optionalAuthenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { videoController } from '../controllers/video.controller.js'
import {
  createVideoSchema,
  updateVideoSchema,
  updateVideoStatusSchema,
} from '../validations/video.validation.js'

const router = Router()

const CAN_MANAGE = [ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN]

// Public: published, public videos.
router.get('/', videoController.listPublished)

// Public: a given author's published videos, for their public profile page.
// Declared before "/:id" so "author" is never swallowed by the param route.
router.get('/author/:id', videoController.listByAuthor)

// Public: a given reader's liked videos, for their public profile page.
router.get('/liked/:id', videoController.listLiked)

// Author/editor/admin: the signed-in user's own videos, any status.
// Declared before "/:id" so "mine" is never swallowed by the param route.
router.get('/mine', authenticate, authorize(...CAN_MANAGE), videoController.listMine)

router.post(
  '/',
  authenticate,
  authorize(...CAN_MANAGE),
  validate(createVideoSchema),
  videoController.create,
)

// Public-ish: published/public videos are visible to anyone; drafts/private
// videos are only visible to their owner or an editor/admin (enforced in
// the service).
router.get('/:id', optionalAuthenticate, videoController.getById)

router.patch(
  '/:id',
  authenticate,
  authorize(...CAN_MANAGE),
  validate(updateVideoSchema),
  videoController.update,
)

// Authors publish/unpublish their own video directly — no editorial review
// gate, same as articles. Editors/admins can manage any video's status.
router.patch(
  '/:id/status',
  authenticate,
  authorize(...CAN_MANAGE),
  validate(updateVideoStatusSchema),
  videoController.updateStatus,
)

router.post('/:id/view', optionalAuthenticate, videoController.recordView)

router.post('/:id/like', authenticate, videoController.toggleLike)

router.post('/:id/bookmark', authenticate, videoController.toggleBookmark)

router.delete('/:id', authenticate, authorize(...CAN_MANAGE), videoController.remove)

export const videoRoutes = router
