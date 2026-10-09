import { Types } from 'mongoose'
import { Investigation, type InvestigationDocument } from '../models/Investigation.js'
import { INVESTIGATION_STATUSES, type InvestigationStatus } from '../constants/investigationStatus.js'
import type { InvestigationWorkflowStage } from '../constants/editorialWorkflow.js'
import type {
  CreateInvestigationInput,
  UpdateInvestigationInput,
} from '../validations/investigation.validation.js'

export interface CreateInvestigationRepoInput extends CreateInvestigationInput {
  slug: string
  author: string
}

export const investigationRepository = {
  async findById(id: string): Promise<InvestigationDocument | null> {
    return Investigation.findById(id)
  },

  async findByIdPopulated(id: string): Promise<InvestigationDocument | null> {
    return Investigation.findById(id)
      .populate('author', 'name authorProfile.professionalName authorProfile.profileImage')
      .populate('collaborators', 'name')
      .populate('editorComments.editor', 'name')
      .populate('comments.user', 'name')
  },

  // "My Investigations": owned or collaborating, any status.
  async findByAuthorOrCollaborator(userId: string): Promise<InvestigationDocument[]> {
    return Investigation.find({
      $or: [{ author: userId }, { collaborators: userId }],
    }).sort({ updatedAt: -1 })
  },

  async findByStatus(status: InvestigationStatus): Promise<InvestigationDocument[]> {
    return Investigation.find({ status })
      .sort({ updatedAt: -1 })
      .populate('author', 'name')
  },

  async findEditorialWorkflow(): Promise<InvestigationDocument[]> {
    return Investigation.find()
      .select('_id title slug status workflowStage editorialDeadline createdAt updatedAt author')
      .sort({ editorialDeadline: 1, updatedAt: -1 })
      .populate('author', 'name')
  },

  async findPublished(category?: string): Promise<InvestigationDocument[]> {
    const query: Record<string, unknown> = { status: INVESTIGATION_STATUSES.PUBLISHED }
    if (category) query.category = category
    return Investigation.find(query)
      .sort({ publishedAt: -1 })
      .populate('author', 'name authorProfile.professionalName authorProfile.profileImage')
  },

  async create(input: CreateInvestigationRepoInput): Promise<InvestigationDocument> {
    return Investigation.create({ ...input, status: INVESTIGATION_STATUSES.DRAFT })
  },

  async updateById(id: string, input: UpdateInvestigationInput): Promise<void> {
    await Investigation.updateOne({ _id: id }, { $set: input })
  },

  async deleteById(id: string): Promise<void> {
    await Investigation.deleteOne({ _id: id })
  },

  async setStatus(
    id: string,
    status: InvestigationStatus,
    extra: { publishedAt?: Date; rejectionReason?: string; workflowStage?: InvestigationWorkflowStage } = {},
  ): Promise<void> {
    const set: Record<string, unknown> = { status, ...extra }
    if (status !== INVESTIGATION_STATUSES.REJECTED) set.rejectionReason = undefined
    await Investigation.updateOne({ _id: id }, { $set: set })
  },

  async updateEditorialWorkflow(
    id: string,
    workflow: { workflowStage: InvestigationWorkflowStage; editorialDeadline: Date | null },
  ): Promise<void> {
    await Investigation.updateOne(
      { _id: id },
      {
        $set: {
          workflowStage: workflow.workflowStage,
          ...(workflow.editorialDeadline
            ? { editorialDeadline: new Date(`${workflow.editorialDeadline}T00:00:00.000Z`) }
            : {}),
        },
        ...(workflow.editorialDeadline === null ? { $unset: { editorialDeadline: 1 } } : {}),
      },
    )
  },

  async incrementViews(id: string): Promise<void> {
    await Investigation.updateOne({ _id: id }, { $inc: { viewsCount: 1 } })
  },

  async addTimelineEntry(
    id: string,
    entry: { date: Date; title: string; description: string; visibility: 'public' | 'internal' },
  ): Promise<void> {
    await Investigation.updateOne({ _id: id }, { $push: { timeline: entry } })
  },

  async removeTimelineEntry(id: string, entryId: string): Promise<void> {
    await Investigation.updateOne({ _id: id }, { $pull: { timeline: { _id: entryId } } })
  },

  async addEditorComment(id: string, editorId: string, message: string): Promise<void> {
    await Investigation.updateOne(
      { _id: id },
      { $push: { editorComments: { editor: new Types.ObjectId(editorId), message, createdAt: new Date() } } },
    )
  },

  async addComment(id: string, userId: string, content: string): Promise<void> {
    await Investigation.updateOne(
      { _id: id },
      { $push: { comments: { user: new Types.ObjectId(userId), content, createdAt: new Date() } } },
    )
  },

  async toggleBookmark(
    id: string,
    userId: string,
  ): Promise<{ bookmarksCount: number; bookmarked: boolean } | null> {
    const investigation = await Investigation.findById(id)
    if (!investigation) return null

    const alreadyBookmarked = investigation.bookmarkedBy.some((entry) => entry.user.toString() === userId)
    if (alreadyBookmarked) {
      investigation.bookmarkedBy = investigation.bookmarkedBy.filter(
        (entry) => entry.user.toString() !== userId,
      )
      investigation.bookmarksCount = Math.max(0, investigation.bookmarksCount - 1)
    } else {
      investigation.bookmarkedBy.push({ user: new Types.ObjectId(userId), savedAt: new Date() })
      investigation.bookmarksCount += 1
    }
    await investigation.save()

    return { bookmarksCount: investigation.bookmarksCount, bookmarked: !alreadyBookmarked }
  },

  async findBookmarkedByUser(userId: string): Promise<Array<{ investigation: InvestigationDocument; savedAt: Date }>> {
    const investigations = await Investigation.find({ 'bookmarkedBy.user': userId }).populate('author', 'name')
    return investigations.map((investigation) => {
      const entry = investigation.bookmarkedBy.find((item) => item.user.toString() === userId)
      return { investigation, savedAt: entry?.savedAt ?? investigation.updatedAt }
    })
  },

  async toggleFollow(
    id: string,
    userId: string,
  ): Promise<{ following: boolean; followersCount: number } | null> {
    const investigation = await Investigation.findById(id)
    if (!investigation) return null

    const alreadyFollowing = investigation.followedBy.some((followerId) => followerId.toString() === userId)
    if (alreadyFollowing) {
      investigation.followedBy = investigation.followedBy.filter(
        (followerId) => followerId.toString() !== userId,
      )
      investigation.followersCount = Math.max(0, investigation.followersCount - 1)
    } else {
      investigation.followedBy.push(new Types.ObjectId(userId))
      investigation.followersCount += 1
    }
    await investigation.save()

    return { following: !alreadyFollowing, followersCount: investigation.followersCount }
  },
}
