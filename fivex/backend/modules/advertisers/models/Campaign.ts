import { model, Schema, Types, type HydratedDocument } from 'mongoose'
import {
  ALL_CAMPAIGN_PLACEMENTS,
  ALL_CAMPAIGN_STATUSES,
  CAMPAIGN_STATUSES,
  type CampaignPlacement,
  type CampaignStatus,
} from '../constants/advertiser.js'

export interface ICampaign {
  advertiser: Types.ObjectId
  name: string
  placement: CampaignPlacement
  status: CampaignStatus
  // Money is stored in cents so totals never pick up floating-point error.
  budgetCents: number
  impressions: number
  clicks: number
  createdAt: Date
  updatedAt: Date
}

export type CampaignDocument = HydratedDocument<ICampaign>

const campaignSchema = new Schema<ICampaign>(
  {
    advertiser: { type: Schema.Types.ObjectId, ref: 'Advertiser', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    placement: { type: String, enum: ALL_CAMPAIGN_PLACEMENTS, required: true },
    status: { type: String, enum: ALL_CAMPAIGN_STATUSES, default: CAMPAIGN_STATUSES.PENDING_REVIEW },
    budgetCents: { type: Number, default: 0, min: 0 },
    impressions: { type: Number, default: 0, min: 0 },
    clicks: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        ret.advertiser = String(ret.advertiser)
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

campaignSchema.index({ advertiser: 1, updatedAt: -1 })

export const Campaign = model<ICampaign>('Campaign', campaignSchema)
