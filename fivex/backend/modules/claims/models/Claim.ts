import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import { CLAIM_STATUSES, EVIDENCE_STATUSES, type ClaimStatus, type EvidenceStatus } from '../constants/claimStatus.js'

export interface IClaim {
  article: Types.ObjectId
  text: string
  status: ClaimStatus
  // The editor currently responsible for verifying this claim.
  assignee?: Types.ObjectId
  evidenceStatus: EvidenceStatus
  evidenceSummary?: string
  sources: string[]
  createdBy: Types.ObjectId
  // Set when the claim reaches a verdict; cleared if it is reopened.
  reviewedBy?: Types.ObjectId
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type ClaimDocument = HydratedDocument<IClaim>

const claimSchema = new Schema<IClaim>(
  {
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: CLAIM_STATUSES, default: 'unreviewed', index: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    evidenceStatus: { type: String, enum: EVIDENCE_STATUSES, default: 'none' },
    evidenceSummary: { type: String, trim: true, maxlength: 2000 },
    sources: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
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

claimSchema.index({ article: 1, status: 1 })

export const Claim = model<IClaim>('Claim', claimSchema)
