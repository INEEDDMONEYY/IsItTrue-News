import { Types } from 'mongoose'
import { logger } from '../../../config/logger.js'
import type { Role } from '../../../shared/constants/roles.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import type { ClaimEventAction } from '../constants/claimEvent.js'
import type { AssessmentStatus, WorkflowStatus } from '../constants/claimStatus.js'
import type { ClaimDocument } from '../models/Claim.js'
import type { IAssessmentSnapshot } from '../models/ClaimEvent.js'
import { claimEventRepository } from '../repositories/claimEvent.repository.js'

interface Actor {
  id: string
  role: Role
}

export interface PersonRef {
  id: string
  name: string
}

interface RecordInput {
  claim: Pick<ClaimDocument, '_id' | 'article' | 'text'>
  actor: Actor
  action: ClaimEventAction
  note?: string
  fromWorkflow?: WorkflowStatus
  toWorkflow?: WorkflowStatus
  fromAssessment?: AssessmentStatus
  toAssessment?: AssessmentStatus
  fromAssignee?: PersonRef | null
  toAssignee?: PersonRef | null
  previousAssessment?: IAssessmentSnapshot
  changedFields?: string[]
}

const person = (ref: PersonRef | null | undefined) =>
  ref ? { id: new Types.ObjectId(ref.id), name: ref.name } : undefined

// The conclusion as it stands now, ready to be stored before it is replaced or cleared. Returns nothing when
// there is no conclusion to keep.
export async function snapshotAssessment(claim: ClaimDocument): Promise<IAssessmentSnapshot | undefined> {
  if (claim.assessmentStatus === 'none') return undefined
  const decider = claim.reviewedBy ? await userRepository.findById(claim.reviewedBy.toString()) : null
  return {
    assessmentStatus: claim.assessmentStatus,
    conclusion: claim.assessment?.conclusion,
    reasoning: claim.assessment?.reasoning,
    limitations: claim.assessment?.limitations,
    uncertainty: claim.assessment?.uncertainty,
    decidedBy: claim.reviewedBy,
    decidedByName: decider?.name,
    decidedAt: claim.reviewedAt,
  }
}

export const claimEventService = {
  // The record is a side effect of the action it describes. A failure to write it is logged loudly but must
  // not undo or block a decision that has already been made.
  async record(input: RecordInput): Promise<void> {
    try {
      const actorUser = await userRepository.findById(input.actor.id)
      await claimEventRepository.record({
        claim: new Types.ObjectId(input.claim._id.toString()),
        article: new Types.ObjectId(input.claim.article.toString()),
        claimText: input.claim.text,
        action: input.action,
        actor: new Types.ObjectId(input.actor.id),
        actorName: actorUser?.name ?? 'Unknown user',
        actorRole: input.actor.role,
        ...(input.note ? { note: input.note } : {}),
        ...(input.fromWorkflow ? { fromWorkflow: input.fromWorkflow } : {}),
        ...(input.toWorkflow ? { toWorkflow: input.toWorkflow } : {}),
        ...(input.fromAssessment ? { fromAssessment: input.fromAssessment } : {}),
        ...(input.toAssessment ? { toAssessment: input.toAssessment } : {}),
        ...(input.fromAssignee ? { fromAssignee: person(input.fromAssignee) } : {}),
        ...(input.toAssignee ? { toAssignee: person(input.toAssignee) } : {}),
        ...(input.previousAssessment ? { previousAssessment: input.previousAssessment } : {}),
        ...(input.changedFields?.length ? { changedFields: input.changedFields } : {}),
      })
    } catch (error) {
      logger.error(`Failed to write the history entry "${input.action}" for claim ${input.claim._id}.`, error)
    }
  },

  async listForClaim(claimId: string, limit = 300) {
    const [entries, total] = await Promise.all([
      claimEventRepository.findByClaim(claimId, limit),
      claimEventRepository.countByClaim(claimId),
    ])
    return { entries, total }
  },
}
