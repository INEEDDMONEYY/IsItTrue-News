import { Schema, model, Types, type HydratedDocument } from 'mongoose'
import { FACT_CHECK_STATUSES, type FactCheckStatus } from '../constants/factCheckStatus.js'

export interface IFactCheckRequest {
  article: Types.ObjectId
  requestedBy: Types.ObjectId
  claim: string
  sources: string
  notes: string
  status: FactCheckStatus
  rejectionReason?: string
  reviewedBy?: Types.ObjectId
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type FactCheckRequestDocument = HydratedDocument<IFactCheckRequest>

const factCheckRequestSchema = new Schema<IFactCheckRequest>(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claim: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    sources: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    notes: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: Object.values(FACT_CHECK_STATUSES),
      default: FACT_CHECK_STATUSES.PENDING,
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
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

factCheckRequestSchema.index({ status: 1, createdAt: -1 })

export const FactCheckRequest = model<IFactCheckRequest>('FactCheckRequest', factCheckRequestSchema)
