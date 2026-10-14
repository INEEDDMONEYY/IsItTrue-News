import { Router } from 'express'
import { authenticate } from '../../../middleware/authenticate.js'
import { authorize } from '../../../middleware/authorize.js'
import { validate } from '../../../middleware/validate.js'
import { ROLES } from '../../../shared/constants/roles.js'
import { adminClaimController } from '../controllers/adminClaim.controller.js'
import {
  assignSchema,
  clearFlagSchema,
  commentSchema,
  escalateSchema,
  flagEvidenceSchema,
  investigationLinkSchema,
  metadataSchema,
  resolveEscalationSchema,
  restrictionSchema,
  returnSchema,
  revisionSchema,
  unassignSchema,
} from '../validations/adminClaim.validation.js'

const router = Router()

// The admin's view of every claim verification record. Editors do their own work through /api/claims.
router.use(authenticate, authorize(ROLES.ADMIN))

// Fixed paths come before "/:id" so they are never read as an id.
router.get('/overview', adminClaimController.overview)
router.get('/reviewers', adminClaimController.reviewers)
router.get('/investigations', adminClaimController.investigations)
router.get('/', adminClaimController.list)

router.get('/:id', adminClaimController.get)
router.get('/:id/history', adminClaimController.history)

router.post('/:id/assign', validate(assignSchema), adminClaimController.assign)
router.post('/:id/unassign', validate(unassignSchema), adminClaimController.unassign)
router.post('/:id/return', validate(returnSchema), adminClaimController.returnForReview)
router.post('/:id/escalate', validate(escalateSchema), adminClaimController.escalate)
router.post('/:id/resolve-escalation', validate(resolveEscalationSchema), adminClaimController.resolveEscalation)
router.post('/:id/evidence-flag', validate(flagEvidenceSchema), adminClaimController.flagEvidence)
router.delete('/:id/evidence-flag', validate(clearFlagSchema), adminClaimController.clearEvidenceFlag)
router.patch('/:id/evidence/:itemId/restriction', validate(restrictionSchema), adminClaimController.setEvidenceRestriction)
router.post('/:id/assessment-revision', validate(revisionSchema), adminClaimController.reviseAssessment)
router.patch('/:id/metadata', validate(metadataSchema), adminClaimController.correctMetadata)
router.post('/:id/comments', validate(commentSchema), adminClaimController.comment)
router.put('/:id/investigation', validate(investigationLinkSchema), adminClaimController.linkInvestigation)

export const adminClaimRoutes = router
