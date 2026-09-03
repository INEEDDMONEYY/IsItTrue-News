import { Evidence, type EvidenceDocument, type EvidenceKind } from '../models/Evidence.js'
import type { CreateEvidenceInput, UpdateEvidenceInput } from '../validations/evidence.validation.js'

export interface CreateEvidenceRepoInput extends CreateEvidenceInput {
  investigation: string
  uploadedBy: string
}

export const evidenceRepository = {
  async findById(id: string): Promise<EvidenceDocument | null> {
    return Evidence.findById(id)
  },

  // Full vault contents (private + public) for one investigation — author/
  // editor/admin only, enforced by the service/route layer, never by this
  // query itself.
  async findByInvestigation(investigationId: string): Promise<EvidenceDocument[]> {
    return Evidence.find({ investigation: investigationId }).sort({ createdAt: -1 })
  },

  // Global vault across every investigation a user owns or collaborates on
  // (feeds the "Evidence Vault" sidebar page).
  async findByInvestigationIds(investigationIds: string[]): Promise<EvidenceDocument[]> {
    return Evidence.find({ investigation: { $in: investigationIds } })
      .sort({ createdAt: -1 })
      .populate('investigation', 'title slug status')
  },

  async findAll(): Promise<EvidenceDocument[]> {
    return Evidence.find().sort({ createdAt: -1 }).populate('investigation', 'title slug status')
  },

  // Reader-facing Evidence Viewer: only approved, public, reader-safe kinds.
  async findPublicByInvestigation(investigationId: string, allowedKinds: EvidenceKind[]): Promise<EvidenceDocument[]> {
    return Evidence.find({
      investigation: investigationId,
      visibility: 'public',
      kind: { $in: allowedKinds },
      approvedAt: { $exists: true },
    }).sort({ createdAt: 1 })
  },

  async create(input: CreateEvidenceRepoInput): Promise<EvidenceDocument> {
    return Evidence.create(input)
  },

  async updateById(id: string, input: UpdateEvidenceInput): Promise<void> {
    await Evidence.updateOne({ _id: id }, { $set: input })
  },

  async approve(id: string, editorId: string, watermarked: boolean): Promise<void> {
    await Evidence.updateOne(
      { _id: id },
      { $set: { visibility: 'public', approvedBy: editorId, approvedAt: new Date(), watermarked } },
    )
  },

  async revoke(id: string): Promise<void> {
    await Evidence.updateOne(
      { _id: id },
      { $set: { visibility: 'private' }, $unset: { approvedBy: '', approvedAt: '' } },
    )
  },

  async deleteById(id: string): Promise<void> {
    await Evidence.deleteOne({ _id: id })
  },
}
