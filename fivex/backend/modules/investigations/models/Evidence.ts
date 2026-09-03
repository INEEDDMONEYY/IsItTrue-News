import { Schema, model, type HydratedDocument, type Types } from 'mongoose'

export const EVIDENCE_KINDS = [
  'document',
  'photo',
  'video',
  'note',
  'foia',
  'interview_transcript',
] as const
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number]

// Only these kinds are ever eligible to be approved for the public Evidence
// Viewer — raw notes/FOIA responses/interview transcripts stay vault-only
// forever, regardless of what an author sets `visibility` to (enforced in
// evidence.service.ts, not just here).
export const PUBLIC_ELIGIBLE_EVIDENCE_KINDS: EvidenceKind[] = ['document', 'photo', 'video']

export const EVIDENCE_VISIBILITY = ['private', 'public'] as const
export type EvidenceVisibility = (typeof EVIDENCE_VISIBILITY)[number]

export interface IEvidence {
  investigation: Types.ObjectId
  uploadedBy: Types.ObjectId
  kind: EvidenceKind
  visibility: EvidenceVisibility
  watermarked: boolean
  title: string
  description?: string
  url?: string
  thumbnailUrl?: string
  source?: string
  approvedBy?: Types.ObjectId
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type EvidenceDocument = HydratedDocument<IEvidence>

const evidenceSchema = new Schema<IEvidence>(
  {
    investigation: { type: Schema.Types.ObjectId, ref: 'Investigation', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: EVIDENCE_KINDS, required: true },
    visibility: { type: String, enum: EVIDENCE_VISIBILITY, default: 'private' },
    watermarked: { type: Boolean, default: false },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    url: { type: String },
    thumbnailUrl: { type: String },
    source: { type: String, trim: true, maxlength: 300 },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

evidenceSchema.index({ investigation: 1, visibility: 1 })
evidenceSchema.index({ investigation: 1, createdAt: -1 })

export const Evidence = model<IEvidence>('Evidence', evidenceSchema)
