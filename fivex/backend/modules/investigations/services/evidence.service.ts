import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { INVESTIGATION_FREE_LIMITS } from '../../../shared/constants/plan.js'
import { hasPremiumAccess } from '../../../shared/constants/features.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { investigationRepository } from '../repositories/investigation.repository.js'
import { evidenceRepository } from '../repositories/evidence.repository.js'
import { PUBLIC_ELIGIBLE_EVIDENCE_KINDS } from '../models/Evidence.js'
import { INVESTIGATION_STATUSES } from '../constants/investigationStatus.js'
import type { InvestigationDocument } from '../models/Investigation.js'
import type { CreateEvidenceInput, UpdateEvidenceInput } from '../validations/evidence.validation.js'

interface ActingUser {
  id: string
  role: Role
}

function isPrivilegedRole(role: Role): boolean {
  return role === ROLES.EDITOR || role === ROLES.ADMIN
}

async function getInvestigationOrThrow(investigationId: string): Promise<InvestigationDocument> {
  const investigation = await investigationRepository.findById(investigationId)
  if (!investigation) throw new AppError('Investigation not found.', 404)
  return investigation
}

// The Evidence Vault is strictly author/collaborator/editor/admin — never
// visible to readers, enforced here independent of the route middleware.
function assertCanAccessVault(investigation: InvestigationDocument, actingUser: ActingUser) {
  const isOwner = investigation.author.toString() === actingUser.id
  const isCollaborator = investigation.collaborators.some((id) => id.toString() === actingUser.id)
  if (!isOwner && !isCollaborator && !isPrivilegedRole(actingUser.role)) {
    throw new AppError('You do not have permission to access this evidence vault.', 403)
  }
}

async function resolveAccessTier(actingUserId?: string): Promise<'anonymous' | 'free' | 'premium'> {
  if (!actingUserId) return 'anonymous'
  const user = await userRepository.findById(actingUserId)
  if (!user) return 'anonymous'
  return hasPremiumAccess('fullInvestigations', user.plan) ? 'premium' : 'free'
}

export const evidenceService = {
  async listVault(investigationId: string, actingUser: ActingUser) {
    const investigation = await getInvestigationOrThrow(investigationId)
    assertCanAccessVault(investigation, actingUser)
    return evidenceRepository.findByInvestigation(investigationId)
  },

  // Global vault across every investigation the user owns/collaborates on
  // (editor/admin see everything) — feeds the standalone "Evidence Vault"
  // workspace page.
  async listMyVault(actingUser: ActingUser) {
    if (isPrivilegedRole(actingUser.role)) {
      return evidenceRepository.findAll()
    }
    const investigations = await investigationRepository.findByAuthorOrCollaborator(actingUser.id)
    const ids = investigations.map((investigation) => investigation.id as string)
    if (!ids.length) return []
    return evidenceRepository.findByInvestigationIds(ids)
  },

  async createEvidence(investigationId: string, actingUser: ActingUser, input: CreateEvidenceInput) {
    const investigation = await getInvestigationOrThrow(investigationId)
    assertCanAccessVault(investigation, actingUser)
    return evidenceRepository.create({ ...input, investigation: investigationId, uploadedBy: actingUser.id })
  },

  async updateEvidence(evidenceId: string, actingUser: ActingUser, input: UpdateEvidenceInput) {
    const evidence = await evidenceRepository.findById(evidenceId)
    if (!evidence) throw new AppError('Evidence not found.', 404)
    const investigation = await getInvestigationOrThrow(evidence.investigation.toString())
    assertCanAccessVault(investigation, actingUser)
    await evidenceRepository.updateById(evidenceId, input)
  },

  // Editor/admin only: promotes vault evidence into the reader-facing
  // Evidence Viewer. Notes/FOIA responses/interview transcripts can never be
  // approved for public release, no matter what the author requests — this
  // is a hard security rule enforced server-side, not a UI suggestion.
  async approveForPublic(evidenceId: string, actingUser: ActingUser) {
    if (!isPrivilegedRole(actingUser.role)) {
      throw new AppError('Only an editor or admin can approve evidence for public release.', 403)
    }
    const evidence = await evidenceRepository.findById(evidenceId)
    if (!evidence) throw new AppError('Evidence not found.', 404)
    if (!PUBLIC_ELIGIBLE_EVIDENCE_KINDS.includes(evidence.kind)) {
      throw new AppError(
        'Raw notes, FOIA responses, and interview transcripts can never be released publicly.',
        400,
      )
    }
    // Documents are always watermarked once released publicly; photos/videos
    // keep whatever watermark state the vault entry already had.
    const watermarked = evidence.kind === 'document' ? true : evidence.watermarked
    await evidenceRepository.approve(evidenceId, actingUser.id, watermarked)
  },

  async revokePublic(evidenceId: string, actingUser: ActingUser) {
    if (!isPrivilegedRole(actingUser.role)) {
      throw new AppError('Only an editor or admin can revoke public evidence.', 403)
    }
    const evidence = await evidenceRepository.findById(evidenceId)
    if (!evidence) throw new AppError('Evidence not found.', 404)
    await evidenceRepository.revoke(evidenceId)
  },

  async deleteEvidence(evidenceId: string, actingUser: ActingUser) {
    const evidence = await evidenceRepository.findById(evidenceId)
    if (!evidence) throw new AppError('Evidence not found.', 404)
    const investigation = await getInvestigationOrThrow(evidence.investigation.toString())
    const isOwner = investigation.author.toString() === actingUser.id
    if (!isOwner && !isPrivilegedRole(actingUser.role)) {
      throw new AppError('You do not have permission to delete this evidence.', 403)
    }
    await evidenceRepository.deleteById(evidenceId)
  },

  // Reader-facing Evidence Viewer: only approved public document/photo/video
  // evidence on a PUBLISHED investigation, with a free/anonymous blur cap.
  // No raw files, no uploader identity, no metadata, no drafts — ever.
  async listPublic(investigationId: string, actingUserId?: string) {
    const investigation = await getInvestigationOrThrow(investigationId)
    if (investigation.status !== INVESTIGATION_STATUSES.PUBLISHED) {
      throw new AppError('Investigation not found.', 404)
    }

    const tier = await resolveAccessTier(actingUserId)
    const evidence = await evidenceRepository.findPublicByInvestigation(
      investigationId,
      PUBLIC_ELIGIBLE_EVIDENCE_KINDS,
    )
    const limit = tier === 'premium' ? evidence.length : INVESTIGATION_FREE_LIMITS.freeEvidenceItems

    return evidence.map((item, index) => {
      const locked = index >= limit
      const json = item.toJSON() as Record<string, unknown>
      delete json.source
      delete json.uploadedBy
      delete json.approvedBy
      if (locked) {
        delete json.url
        json.description = undefined
      }
      return { ...json, locked }
    })
  },
}
