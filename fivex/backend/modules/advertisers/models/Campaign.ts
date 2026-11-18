import { model, Schema, Types, type HydratedDocument } from 'mongoose'
import {
  AD_TARGET_PAGES,
  ALL_CAMPAIGN_PLACEMENTS,
  ALL_CAMPAIGN_STATUSES,
  CAMPAIGN_STATUSES,
  type AdTargetPage,
  type CampaignPlacement,
  type CampaignStatus,
} from '../constants/advertiser.js'
import { CAMPAIGN_DURATIONS } from '../constants/pricing.js'
import { SECTION_SLOT_IDS, type SectionSlotId } from '../constants/slots.js'

export interface ICampaignCreative {
  headline: string
  body: string
  ctaLabel: string
  destinationUrl: string
  // Copied from the Ad Library asset when chosen, so the ad keeps rendering even if the library entry is renamed.
  imageUrl?: string
  imageAsset?: Types.ObjectId
}

export interface ICampaign {
  advertiser: Types.ObjectId
  name: string
  placement: CampaignPlacement
  status: CampaignStatus
  creative: ICampaignCreative
  // Only used by the "Selected Page" placement.
  targetPages: AdTargetPage[]
  // Category slugs. Each chosen category is billed as one page.
  targetCategories: string[]
  // Only used by the "Section Ad" placement: the section slot the ad holds.
  sectionSlot?: SectionSlotId
  // Money is stored in cents so totals never pick up floating-point error. It holds the server-computed price.
  budgetCents: number
  durationDays: number
  // Newsletter ads only: how many distributions the advertiser bought.
  sends: number
  // Shared by the campaigns created from one bundle.
  bundleId?: string
  startDate?: Date
  endDate?: Date
  submittedAt?: Date
  reviewedAt?: Date
  reviewNote?: string
  impressions: number
  clicks: number
  createdAt: Date
  updatedAt: Date
}

export type CampaignDocument = HydratedDocument<ICampaign>

const creativeSchema = new Schema<ICampaignCreative>(
  {
    headline: { type: String, trim: true, maxlength: 80, default: '' },
    body: { type: String, trim: true, maxlength: 200, default: '' },
    ctaLabel: { type: String, trim: true, maxlength: 24, default: 'Learn more' },
    destinationUrl: { type: String, trim: true, maxlength: 2048, default: '' },
    imageUrl: { type: String, trim: true, maxlength: 2048 },
    imageAsset: { type: Schema.Types.ObjectId, ref: 'AdAsset' },
  },
  { _id: false },
)

const campaignSchema = new Schema<ICampaign>(
  {
    advertiser: { type: Schema.Types.ObjectId, ref: 'Advertiser', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    placement: { type: String, enum: ALL_CAMPAIGN_PLACEMENTS, required: true },
    status: { type: String, enum: ALL_CAMPAIGN_STATUSES, default: CAMPAIGN_STATUSES.DRAFT },
    creative: { type: creativeSchema, default: () => ({}) },
    targetPages: { type: [{ type: String, enum: AD_TARGET_PAGES }], default: [] },
    targetCategories: { type: [String], default: [] },
    sectionSlot: { type: String, enum: SECTION_SLOT_IDS },
    budgetCents: { type: Number, default: 0, min: 0 },
    durationDays: { type: Number, enum: CAMPAIGN_DURATIONS, default: 30 },
    sends: { type: Number, default: 1, min: 1 },
    // Bundle ids are "<bundle id>-<uuid>", at most 19 + 1 + 36 characters.
    bundleId: { type: String, maxlength: 64 },
    startDate: { type: Date },
    endDate: { type: Date },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true, maxlength: 500 },
    impressions: { type: Number, default: 0, min: 0 },
    clicks: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id)
        ret.advertiser = String(ret.advertiser)
        const creative = ret.creative as Record<string, unknown> | undefined
        if (creative?.imageAsset) creative.imageAsset = String(creative.imageAsset)
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

campaignSchema.index({ advertiser: 1, updatedAt: -1 })
campaignSchema.index({ advertiser: 1, status: 1 })
campaignSchema.index({ 'creative.imageAsset': 1 }, { sparse: true })
campaignSchema.index({ advertiser: 1, bundleId: 1 }, { sparse: true })

export const Campaign = model<ICampaign>('Campaign', campaignSchema)
