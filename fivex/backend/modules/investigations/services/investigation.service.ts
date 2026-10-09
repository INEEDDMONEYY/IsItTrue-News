import { AppError } from '../../../shared/errors/AppError.js'
import { ROLES, type Role } from '../../../shared/constants/roles.js'
import { INVESTIGATION_FREE_LIMITS } from '../../../shared/constants/plan.js'
import { hasPremiumAccess } from '../../../shared/constants/features.js'
import { slugify } from '../../../utils/slug.js'
import { userRepository } from '../../users/repositories/user.repository.js'
import { investigationRepository } from '../repositories/investigation.repository.js'
import { INVESTIGATION_STATUSES } from '../constants/investigationStatus.js'
import type { InvestigationWorkflowStage } from '../constants/editorialWorkflow.js'
import type { InvestigationDocument } from '../models/Investigation.js'
import type {
  CreateInvestigationInput,
  UpdateInvestigationInput,
} from '../validations/investigation.validation.js'

export interface ActingUser {
  id: string
  role: Role
}

export type InvestigationAccessTier = 'anonymous' | 'free' | 'premium'

function isPrivilegedRole(role: Role): boolean {
  return role === ROLES.EDITOR || role === ROLES.ADMIN
}

export function canManageInvestigation(investigation: InvestigationDocument, actingUser?: ActingUser): boolean {
  if (!actingUser) return false
  const isOwner = investigation.author.toString() === actingUser.id
  const isCollaborator = investigation.collaborators.some((id) => id.toString() === actingUser.id)
  return isOwner || isCollaborator || isPrivilegedRole(actingUser.role)
}

function assertCanManage(investigation: InvestigationDocument, actingUser: ActingUser) {
  if (!canManageInvestigation(investigation, actingUser)) {
    throw new AppError('You do not have permission to access this investigation.', 403)
  }
}

// Editors/admins can edit anything; owners/collaborators can only edit
// content that isn't published yet (once live, only editorial staff touch it).
function assertCanEditContent(investigation: InvestigationDocument, actingUser: ActingUser) {
  assertCanManage(investigation, actingUser)
  if (!isPrivilegedRole(actingUser.role) && investigation.status === INVESTIGATION_STATUSES.PUBLISHED) {
    throw new AppError('Published investigations can only be edited by an editor or admin.', 403)
  }
}

async function resolveAccessTier(actingUserId?: string): Promise<InvestigationAccessTier> {
  if (!actingUserId) return 'anonymous'
  const user = await userRepository.findById(actingUserId)
  if (!user) return 'anonymous'
  return hasPremiumAccess('fullInvestigations', user.plan) ? 'premium' : 'free'
}

// Reader-facing sanitization: strips every internal-only field (notes,
// editor comments, rejection reason, collaborator/bookmark identities) and
// applies the free/anonymous timeline blur cap. Never used for the
// author/editor workspace view.
function serializePublic(
  investigation: InvestigationDocument,
  tier: InvestigationAccessTier,
  actingUserId?: string,
) {
  const json = investigation.toJSON() as Record<string, unknown>

  delete json.internalNotes
  delete json.editorComments
  delete json.rejectionReason
  delete json.workflowStage
  delete json.editorialDeadline
  delete json.collaborators
  delete json.followedBy
  delete json.bookmarkedBy

  const publicTimeline = investigation.timeline.filter((entry) => entry.visibility === 'public')
  const timelineLimit = tier === 'premium' ? publicTimeline.length : INVESTIGATION_FREE_LIMITS.freeTimelineEntries
  json.timeline = publicTimeline.map((entry, index) => {
    const locked = index >= timelineLimit
    return {
      id: String(entry._id),
      date: entry.date,
      title: entry.title,
      description: locked ? undefined : entry.description,
      locked,
    }
  })

  json.comments = investigation.comments.map((comment) => ({
    id: String(comment._id),
    user: comment.user,
    content: comment.content,
    createdAt: comment.createdAt,
  }))

  json.following = actingUserId
    ? investigation.followedBy.some((id) => id.toString() === actingUserId)
    : false
  json.bookmarked = actingUserId
    ? investigation.bookmarkedBy.some((entry) => entry.user.toString() === actingUserId)
    : false

  return json
}

function serializePublicSummary(investigation: InvestigationDocument) {
  const json = investigation.toJSON() as Record<string, unknown>
  return {
    id: json.id,
    title: json.title,
    subheadline: json.subheadline,
    slug: json.slug,
    summary: json.summary,
    coverImage: json.coverImage,
    category: json.category,
    author: json.author,
    publishedAt: json.publishedAt,
    followersCount: json.followersCount,
    bookmarksCount: json.bookmarksCount,
    viewsCount: json.viewsCount,
  }
}

export const investigationService = {
  async createInvestigation(authorId: string, input: CreateInvestigationInput) {
    const slug = `${slugify(input.title) || 'investigation'}-${Date.now()}`
    return investigationRepository.create({ ...input, slug, author: authorId })
  },

  // "My Investigations" — owned or collaborating, any status.
  async listMine(userId: string) {
    return investigationRepository.findByAuthorOrCollaborator(userId)
  },

  // Editor/admin verification queue.
  async listReviewQueue() {
    return investigationRepository.findByStatus(INVESTIGATION_STATUSES.PENDING_REVIEW)
  },

  async listEditorialWorkflow() {
    const investigations = await investigationRepository.findEditorialWorkflow()
    return investigations.map((investigation) => ({
      ...investigation.toJSON(),
      workflowStage:
        investigation.workflowStage ??
        (investigation.status === INVESTIGATION_STATUSES.PUBLISHED
          ? 'publication'
          : investigation.status === INVESTIGATION_STATUSES.PENDING_REVIEW
            ? 'editorial_review'
            : 'research'),
    }))
  },

  async updateEditorialWorkflow(
    id: string,
    actingUser: ActingUser,
    workflow: { workflowStage: InvestigationWorkflowStage; editorialDeadline: string | null },
  ) {
    if (!isPrivilegedRole(actingUser.role)) {
      throw new AppError('Only an editor or admin can update editorial workflow.', 403)
    }
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)
    await investigationRepository.updateEditorialWorkflow(id, {
      workflowStage: workflow.workflowStage,
      editorialDeadline: workflow.editorialDeadline
        ? new Date(`${workflow.editorialDeadline}T00:00:00.000Z`)
        : null,
    })
  },

  // Public: reader-facing listing, sanitized summaries only.
  async listPublished(category?: string) {
    const investigations = await investigationRepository.findPublished(category)
    return investigations.map(serializePublicSummary)
  },

  // Author/collaborator/editor/admin always get the full, unsanitized
  // workspace view regardless of status. Everyone else only ever sees a
  // published investigation, sanitized and access-tier-gated.
  async getById(id: string, actingUser?: ActingUser) {
    const investigation = await investigationRepository.findByIdPopulated(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)

    if (canManageInvestigation(investigation, actingUser)) {
      return { investigation: investigation.toJSON(), workspace: true as const }
    }

    if (investigation.status !== INVESTIGATION_STATUSES.PUBLISHED) {
      throw new AppError('Investigation not found.', 404)
    }

    await investigationRepository.incrementViews(id)
    const tier = await resolveAccessTier(actingUser?.id)
    return {
      investigation: serializePublic(investigation, tier, actingUser?.id),
      workspace: false as const,
      access: { tier },
    }
  },

  async updateInvestigation(id: string, actingUser: ActingUser, input: UpdateInvestigationInput) {
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)
    assertCanEditContent(investigation, actingUser)
    await investigationRepository.updateById(id, input)
  },

  async deleteInvestigation(id: string, actingUser: ActingUser) {
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)

    const isOwner = investigation.author.toString() === actingUser.id
    if (actingUser.role !== ROLES.ADMIN && !(isOwner && investigation.status === INVESTIGATION_STATUSES.DRAFT)) {
      throw new AppError('Only a draft investigation can be deleted, and only by its author.', 403)
    }
    await investigationRepository.deleteById(id)
  },

  async submitForReview(id: string, actingUser: ActingUser) {
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)
    assertCanManage(investigation, actingUser)

    if (
      investigation.status !== INVESTIGATION_STATUSES.DRAFT &&
      investigation.status !== INVESTIGATION_STATUSES.REJECTED
    ) {
      throw new AppError('Only a draft or rejected investigation can be submitted for review.', 400)
    }
    await investigationRepository.setStatus(id, INVESTIGATION_STATUSES.PENDING_REVIEW, {
      workflowStage: 'editorial_review',
    })
  },

  async publish(id: string, actingUser: ActingUser) {
    if (!isPrivilegedRole(actingUser.role)) {
      throw new AppError('Only an editor or admin can publish an investigation.', 403)
    }
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)
    if (investigation.status !== INVESTIGATION_STATUSES.PENDING_REVIEW) {
      throw new AppError('Only an investigation pending review can be published.', 400)
    }
    await investigationRepository.setStatus(id, INVESTIGATION_STATUSES.PUBLISHED, {
      publishedAt: new Date(),
      workflowStage: 'publication',
    })
  },

  async reject(id: string, actingUser: ActingUser, reason: string) {
    if (!isPrivilegedRole(actingUser.role)) {
      throw new AppError('Only an editor or admin can reject an investigation.', 403)
    }
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)
    if (investigation.status !== INVESTIGATION_STATUSES.PENDING_REVIEW) {
      throw new AppError('Only an investigation pending review can be rejected.', 400)
    }
    await investigationRepository.setStatus(id, INVESTIGATION_STATUSES.REJECTED, { rejectionReason: reason })
  },

  async addTimelineEntry(
    id: string,
    actingUser: ActingUser,
    input: { date: string; title: string; description: string; visibility: 'public' | 'internal' },
  ) {
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)
    assertCanManage(investigation, actingUser)
    await investigationRepository.addTimelineEntry(id, {
      date: new Date(input.date),
      title: input.title,
      description: input.description,
      visibility: input.visibility,
    })
  },

  async removeTimelineEntry(id: string, entryId: string, actingUser: ActingUser) {
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)
    assertCanManage(investigation, actingUser)
    await investigationRepository.removeTimelineEntry(id, entryId)
  },

  async addEditorComment(id: string, actingUser: ActingUser, message: string) {
    if (!isPrivilegedRole(actingUser.role)) {
      throw new AppError('Only an editor or admin can add an internal editorial comment.', 403)
    }
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)
    await investigationRepository.addEditorComment(id, actingUser.id, message)
  },

  async addComment(id: string, userId: string, content: string) {
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)
    if (investigation.status !== INVESTIGATION_STATUSES.PUBLISHED) {
      throw new AppError('You can only comment on a published investigation.', 400)
    }
    await investigationRepository.addComment(id, userId, content)
  },

  async toggleBookmark(id: string, userId: string) {
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)
    if (investigation.status !== INVESTIGATION_STATUSES.PUBLISHED) {
      throw new AppError('You can only bookmark a published investigation.', 400)
    }
    const result = await investigationRepository.toggleBookmark(id, userId)
    if (!result) throw new AppError('Investigation not found.', 404)
    return result
  },

  async toggleFollow(id: string, userId: string) {
    const investigation = await investigationRepository.findById(id)
    if (!investigation) throw new AppError('Investigation not found.', 404)
    if (investigation.status !== INVESTIGATION_STATUSES.PUBLISHED) {
      throw new AppError('You can only follow a published investigation.', 400)
    }
    const result = await investigationRepository.toggleFollow(id, userId)
    if (!result) throw new AppError('Investigation not found.', 404)
    return result
  },
}
