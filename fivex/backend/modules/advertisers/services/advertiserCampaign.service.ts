import { randomUUID } from 'node:crypto'
import { Types, type UpdateQuery } from 'mongoose'
import { env } from '../../../config/env.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { Category } from '../../categories/models/Category.js'
import {
  ALL_CAMPAIGN_STATUSES,
  CAMPAIGN_PLACEMENTS,
  CAMPAIGN_STATUSES,
  EDITABLE_CAMPAIGN_STATUSES,
  PLACEMENT_REQUIREMENTS,
  type CampaignPlacement,
  type CampaignStatus,
} from '../constants/advertiser.js'
import { NEWSLETTER_WINDOW_DAYS, PLACEMENT_LABELS, type CampaignDuration } from '../constants/pricing.js'
import type { CampaignDocument, ICampaign } from '../models/Campaign.js'
import { adAssetRepository } from '../repositories/adAsset.repository.js'
import { campaignRepository } from '../repositories/campaign.repository.js'
import type { BundleInput, CampaignEditInput, CampaignInput } from '../validations/advertiser.validation.js'
import { allocateBundle, findBundle, priceForPlacement } from './advertiserPricing.js'

const DAY_MS = 24 * 60 * 60 * 1000
const MAX_CAMPAIGN_NAME = 120

function startOfTodayUtc(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function toDate(value: string | null): Date | null {
  return value ? new Date(`${value}T00:00:00Z`) : null
}

// Newsletter runs for a fixed scheduling window; every other placement runs for the chosen duration.
function runDays(placement: CampaignPlacement, durationDays: CampaignDuration): number {
  return placement === CAMPAIGN_PLACEMENTS.NEWSLETTER ? NEWSLETTER_WINDOW_DAYS : durationDays
}

// The last day is inclusive, so a 7-day campaign starting on the 1st ends on the 7th.
function endDateFor(start: Date, days: number): Date {
  return new Date(start.getTime() + (days - 1) * DAY_MS)
}

function notFound(): AppError {
  return new AppError('Campaign not found.', 404)
}

// Each chosen site page and each chosen category is billed as one page of a Selected Page ad.
function selectedPageCount(input: Pick<CampaignInput, 'targetPages' | 'targetCategories'>): number {
  return input.targetPages.length + input.targetCategories.length
}

// Bundle campaigns share a base name, so the placement is added to tell them apart in the campaign list.
function bundleItemName(name: string, placement: CampaignPlacement): string {
  const suffix = ` · ${PLACEMENT_LABELS[placement]}`
  return `${name.slice(0, MAX_CAMPAIGN_NAME - suffix.length)}${suffix}`
}

function assertId(id: string): void {
  if (!Types.ObjectId.isValid(id)) throw notFound()
}

type CreativeInput = CampaignInput['creative']

// Everything a submission needs, reported together so the advertiser can fix it all in one pass.
function creativeProblems(
  placement: CampaignPlacement,
  creative: CreativeInput,
  hasImage: boolean,
  targets: Pick<CampaignInput, 'targetPages' | 'targetCategories'>,
): string[] {
  const requirements = PLACEMENT_REQUIREMENTS[placement]
  const problems: string[] = []

  if (!creative.headline) problems.push('Add a headline.')
  if (requirements.bodyRequired && !creative.body) problems.push('Add body text for this placement.')
  if (!creative.ctaLabel) problems.push('Add a button label.')
  if (!creative.destinationUrl) problems.push('Add the destination URL readers are sent to.')
  if (requirements.imageRequired && !hasImage) problems.push('Choose an image from your Ad Library for this placement.')
  if (placement === CAMPAIGN_PLACEMENTS.SELECTED_PAGE && selectedPageCount(targets) === 0) {
    problems.push('Choose at least one page or category for a Selected Page ad.')
  }
  return problems
}

function scheduleProblems(start: Date | null): string[] {
  if (!start) return ['Choose a start date.']
  // A day of grace so an advertiser in a timezone behind UTC can still pick "today".
  if (start.getTime() < startOfTodayUtc().getTime() - DAY_MS) return ['The start date cannot be in the past.']
  return []
}

async function resolveOwnedImage(
  advertiserId: string,
  imageAssetId: string | null,
): Promise<{ imageUrl?: string; imageAsset?: Types.ObjectId }> {
  if (!imageAssetId) return {}
  const asset = await adAssetRepository.findOwned(advertiserId, imageAssetId)
  if (!asset) throw new AppError('That image is no longer in your Ad Library. Please choose another.', 400)
  return { imageUrl: asset.url, imageAsset: asset._id }
}

// Saving for review sends the ad back through review; a draft save clears any earlier submission.
function reviewFields(submit: boolean, now: Date): Partial<ICampaign> {
  if (!submit) return { status: CAMPAIGN_STATUSES.DRAFT }
  if (env.ADVERTISER_CAMPAIGN_AUTO_APPROVE) {
    return { status: CAMPAIGN_STATUSES.ACTIVE, submittedAt: now, reviewedAt: now }
  }
  return { status: CAMPAIGN_STATUSES.PENDING_REVIEW, submittedAt: now }
}

interface CampaignPricing {
  priceCents?: number
  bundleId?: string
}

async function buildCampaignFields(
  advertiserId: string,
  input: CampaignInput,
  pricing: CampaignPricing = {},
): Promise<Partial<ICampaign>> {
  const image = await resolveOwnedImage(advertiserId, input.creative.imageAssetId)

  const start = toDate(input.startDate)
  const days = runDays(input.placement, input.durationDays)
  const end = start ? endDateFor(start, days) : null

  const targetCategories = input.placement === CAMPAIGN_PLACEMENTS.SELECTED_PAGE ? input.targetCategories : []
  if (targetCategories.length > 0) {
    const existing = await Category.countDocuments({ slug: { $in: targetCategories } })
    if (existing !== targetCategories.length) {
      throw new AppError('One or more of the chosen categories no longer exists. Please refresh and choose again.', 400)
    }
  }

  if (input.submit) {
    const problems = [
      ...creativeProblems(input.placement, input.creative, Boolean(image.imageAsset), input),
      ...scheduleProblems(start),
    ]
    if (problems.length > 0) throw new AppError(problems.join(' '), 400)
  }

  const fields: Partial<ICampaign> = {
    name: input.name,
    placement: input.placement,
    ...reviewFields(input.submit, new Date()),
    creative: {
      headline: input.creative.headline,
      body: input.creative.body,
      ctaLabel: input.creative.ctaLabel,
      destinationUrl: input.creative.destinationUrl,
      imageUrl: image.imageUrl,
      imageAsset: image.imageAsset,
    },
    // Only a Selected Page ad is targeted; the other placements run site-wide.
    targetPages: input.placement === CAMPAIGN_PLACEMENTS.SELECTED_PAGE ? input.targetPages : [],
    targetCategories,
    budgetCents:
      pricing.priceCents ??
      priceForPlacement(input.placement, {
        durationDays: input.durationDays,
        pages: selectedPageCount(input),
        sends: input.sends,
      }),
    durationDays: days,
    sends: input.placement === CAMPAIGN_PLACEMENTS.NEWSLETTER ? input.sends : 1,
    startDate: start ?? undefined,
    endDate: end ?? undefined,
  }

  if (pricing.bundleId) fields.bundleId = pricing.bundleId

  return fields
}

// Turns plain fields into an update that also clears the optional ones left empty.
function toUpdate(fields: Partial<ICampaign>): UpdateQuery<ICampaign> {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, ''> = { reviewNote: '' }
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) $unset[key] = ''
    else $set[key] = value
  }
  if (!fields.submittedAt) $unset.submittedAt = ''
  if (!fields.reviewedAt) $unset.reviewedAt = ''
  return { $set, $unset }
}

export const advertiserCampaignService = {
  isStatus(value: unknown): value is CampaignStatus {
    return typeof value === 'string' && (ALL_CAMPAIGN_STATUSES as string[]).includes(value)
  },

  async completeEnded(advertiserId: string): Promise<void> {
    await campaignRepository.completeEnded(advertiserId, startOfTodayUtc())
  },

  async list(advertiserId: string, filter: { status?: CampaignStatus; search?: string }): Promise<CampaignDocument[]> {
    await this.completeEnded(advertiserId)
    return campaignRepository.list(advertiserId, filter)
  },

  async get(advertiserId: string, id: string): Promise<CampaignDocument> {
    assertId(id)
    await this.completeEnded(advertiserId)
    const campaign = await campaignRepository.findOwned(advertiserId, id)
    if (!campaign) throw notFound()
    return campaign
  },

  async create(advertiserId: string, input: CampaignInput): Promise<CampaignDocument> {
    const fields = await buildCampaignFields(advertiserId, input)
    return campaignRepository.create({ ...fields, advertiser: new Types.ObjectId(advertiserId) })
  },

  // A bundle becomes one campaign per placement. They share a creative and a bundleId, and the bundle price is
  // split across them, so the bundle's total is what the advertiser pays.
  async createBundle(advertiserId: string, input: BundleInput): Promise<CampaignDocument[]> {
    const bundle = findBundle(input.bundleId)
    if (!bundle) throw new AppError('That bundle is not available.', 400)

    const bundleId = `${bundle.id}-${randomUUID()}`
    const allocations = allocateBundle(bundle, selectedPageCount(input))
    const fieldsList: Partial<ICampaign>[] = []
    const problems = new Set<string>()

    for (const allocation of allocations) {
      const item: CampaignInput = {
        name: bundleItemName(input.name, allocation.placement),
        placement: allocation.placement,
        creative: { ...input.creative, imageAssetId: input.images[allocation.placement] ?? null },
        targetPages: input.targetPages,
        targetCategories: input.targetCategories,
        // Bundles are sold as 30-day campaigns (see BUNDLES in constants/pricing.ts).
        durationDays: 30,
        sends: 1,
        startDate: input.startDate,
        submit: input.submit,
      }
      try {
        fieldsList.push({
          ...(await buildCampaignFields(advertiserId, item, { priceCents: allocation.priceCents, bundleId })),
          advertiser: new Types.ObjectId(advertiserId),
        })
      } catch (error) {
        // Every placement checks the same creative, so the same problem can come back once per item.
        if (!(error instanceof AppError)) throw error
        for (const sentence of error.message.split(/(?<=\.)\s+/)) problems.add(sentence)
      }
    }

    if (problems.size > 0) throw new AppError([...problems].join(' '), 400)
    return campaignRepository.createMany(fieldsList)
  },

  // Only name and creative change. Placement, dates, duration, targets, and budget were paid for, so they stay as
  // stored. Saving takes the ad back through review, since a changed ad is a new ad.
  async update(advertiserId: string, id: string, input: CampaignEditInput): Promise<CampaignDocument> {
    const existing = await this.get(advertiserId, id)
    if (!EDITABLE_CAMPAIGN_STATUSES.includes(existing.status)) {
      throw new AppError(
        existing.status === CAMPAIGN_STATUSES.ACTIVE
          ? 'Pause this campaign before editing it.'
          : 'A completed campaign can no longer be edited.',
        409,
      )
    }

    const image = await resolveOwnedImage(advertiserId, input.creative.imageAssetId)
    if (input.submit) {
      const problems = creativeProblems(existing.placement, input.creative, Boolean(image.imageAsset), existing)
      if (problems.length > 0) throw new AppError(problems.join(' '), 400)
    }

    const fields: Partial<ICampaign> = {
      // A bundle item keeps its placement suffix so it stays identifiable in the campaign list.
      name: existing.bundleId ? bundleItemName(input.name, existing.placement) : input.name,
      ...reviewFields(input.submit, new Date()),
      creative: {
        headline: input.creative.headline,
        body: input.creative.body,
        ctaLabel: input.creative.ctaLabel,
        destinationUrl: input.creative.destinationUrl,
        imageUrl: image.imageUrl,
        imageAsset: image.imageAsset,
      },
    }

    const updated = await campaignRepository.updateIfStatus(advertiserId, id, EDITABLE_CAMPAIGN_STATUSES, toUpdate(fields))
    if (!updated) throw new AppError('This campaign changed while you were editing it. Please reload and try again.', 409)
    return updated
  },


  async pause(advertiserId: string, id: string): Promise<CampaignDocument> {
    await this.get(advertiserId, id)
    const updated = await campaignRepository.updateIfStatus(advertiserId, id, [CAMPAIGN_STATUSES.ACTIVE], {
      $set: { status: CAMPAIGN_STATUSES.PAUSED },
    })
    if (!updated) throw new AppError('Only an active campaign can be paused.', 409)
    return updated
  },

  // A paused campaign was already approved and its ad hasn't changed, so it goes straight back to active.
  async resume(advertiserId: string, id: string): Promise<CampaignDocument> {
    await this.get(advertiserId, id)
    const updated = await campaignRepository.updateIfStatus(advertiserId, id, [CAMPAIGN_STATUSES.PAUSED], {
      $set: { status: CAMPAIGN_STATUSES.ACTIVE },
    })
    if (!updated) throw new AppError('Only a paused campaign can be resumed.', 409)
    return updated
  },

  async remove(advertiserId: string, id: string): Promise<void> {
    const existing = await this.get(advertiserId, id)
    const deletable = ALL_CAMPAIGN_STATUSES.filter((status) => status !== CAMPAIGN_STATUSES.ACTIVE)
    const deleted = await campaignRepository.deleteIfStatus(advertiserId, id, deletable)
    if (!deleted) {
      throw new AppError(
        existing.status === CAMPAIGN_STATUSES.ACTIVE ? 'Pause this campaign before deleting it.' : 'Campaign not found.',
        existing.status === CAMPAIGN_STATUSES.ACTIVE ? 409 : 404,
      )
    }
  },
}
