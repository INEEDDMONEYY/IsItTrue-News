import { Router } from 'express'
import { authenticate, optionalAuthenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { investigationController } from '../controllers/investigation.controller.js'
import { evidenceController } from '../controllers/evidence.controller.js'
import {
  addEditorCommentSchema,
  addInvestigationCommentSchema,
  addTimelineEntrySchema,
  createInvestigationSchema,
  rejectInvestigationSchema,
  updateInvestigationSchema,
  updateEditorialWorkflowSchema,
} from '../validations/investigation.validation.js'
import { createEvidenceSchema, updateEvidenceSchema } from '../validations/evidence.validation.js'

const router = Router()

// Public: reader-facing feed of published investigations.
router.get('/', investigationController.listPublished)

// Author/editor/admin: own/collaborating investigations, any status.
// Declared before "/:id" so "mine"/"review-queue" are never swallowed by
// the param route.
router.get(
  '/mine',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  investigationController.listMine,
)

// Editor/admin: verification queue of investigations pending a publish decision.
router.get(
  '/review-queue',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  investigationController.listReviewQueue,
)

router.get(
  '/editorial-workflow',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  investigationController.listEditorialWorkflow,
)

// Author/collaborator/editor/admin only — the global Evidence Vault across
// every investigation the signed-in user can manage. Declared before "/:id"
// for the same param-swallowing reason as above.
router.get(
  '/evidence/mine',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  evidenceController.listMyVault,
)

router.post(
  '/',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  validate(createInvestigationSchema),
  investigationController.create,
)

// Public-ish: published investigations are visible to anyone (sanitized +
// access-tier gated); drafts/pending/rejected are only visible to their
// author/collaborators/editor/admin (enforced in the service).
router.get('/:id', optionalAuthenticate, investigationController.getById)

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  validate(updateInvestigationSchema),
  investigationController.update,
)

router.patch(
  '/:id/editorial-workflow',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  validate(updateEditorialWorkflowSchema),
  investigationController.updateEditorialWorkflow,
)

router.delete('/:id', authenticate, authorize(ROLES.AUTHOR, ROLES.ADMIN), investigationController.remove)

router.post(
  '/:id/submit',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  investigationController.submit,
)

router.post('/:id/publish', authenticate, authorize(ROLES.EDITOR, ROLES.ADMIN), investigationController.publish)

router.post(
  '/:id/reject',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  validate(rejectInvestigationSchema),
  investigationController.reject,
)

router.post(
  '/:id/timeline',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  validate(addTimelineEntrySchema),
  investigationController.addTimelineEntry,
)

router.delete(
  '/:id/timeline/:entryId',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  investigationController.removeTimelineEntry,
)

router.post(
  '/:id/editor-comments',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  validate(addEditorCommentSchema),
  investigationController.addEditorComment,
)

// Any signed-in reader (or up) can comment on/bookmark/follow a published investigation.
router.post(
  '/:id/comments',
  authenticate,
  validate(addInvestigationCommentSchema),
  investigationController.addComment,
)
router.post('/:id/bookmark', authenticate, investigationController.toggleBookmark)
router.post('/:id/follow', authenticate, investigationController.toggleFollow)

// Reader-facing Evidence Viewer for one investigation (sanitized/approved only).
router.get('/:investigationId/evidence/public', optionalAuthenticate, evidenceController.listPublic)

// Author/collaborator/editor/admin only — the private vault for one investigation.
router.get(
  '/:investigationId/evidence',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  evidenceController.listVault,
)

router.post(
  '/:investigationId/evidence',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  validate(createEvidenceSchema),
  evidenceController.create,
)

router.patch(
  '/:investigationId/evidence/:evidenceId',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  validate(updateEvidenceSchema),
  evidenceController.update,
)

router.post(
  '/:investigationId/evidence/:evidenceId/approve',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  evidenceController.approve,
)

router.post(
  '/:investigationId/evidence/:evidenceId/revoke',
  authenticate,
  authorize(ROLES.EDITOR, ROLES.ADMIN),
  evidenceController.revoke,
)

router.delete(
  '/:investigationId/evidence/:evidenceId',
  authenticate,
  authorize(ROLES.AUTHOR, ROLES.EDITOR, ROLES.ADMIN),
  evidenceController.remove,
)

export const investigationRoutes = router
