import { COMMITTED_CAMPAIGN_STATUSES, type AdTargetPage, type CampaignPlacement } from '../constants/advertiser.js'
import { PLACEMENT_LABELS } from '../constants/pricing.js'
import { PLACEMENT_SURFACES, SECTION_SLOTS, SLOT_PAGE_LABELS, type SectionSlotId, type SlotPage } from '../constants/slots.js'
import { Campaign } from '../models/Campaign.js'

export interface CommittedSlotCampaign {
  placement: CampaignPlacement
  targetPages: AdTargetPage[]
  targetCategories?: string[]
  sectionSlot?: SectionSlotId
}

export interface SectionSlotAvailability {
  id: SectionSlotId
  label: string
  taken: number
  open: number
}

export interface SlotPageAvailability {
  page: SlotPage
  label: string
  capacity: number
  taken: number
  open: number
}

export interface SlotAvailability {
  placement: CampaignPlacement
  label: string
  capacity: number
  pages: SlotPageAvailability[]
  // Committed campaigns per article category slug. Only set for targeted placements (Category Sponsor).
  categoryTaken: Record<string, number>
  // Only set for Section Ad: one entry per section slot.
  sections?: SectionSlotAvailability[]
}

// Pure so the counting rules can be checked without a database. Only counts; it never exposes which advertiser holds a slot.
export function buildSlotAvailability(campaigns: CommittedSlotCampaign[]): SlotAvailability[] {
  return (Object.keys(PLACEMENT_SURFACES) as CampaignPlacement[]).map((placement) => {
    const { pages, capacity, targeted } = PLACEMENT_SURFACES[placement]
    const sold = campaigns.filter((campaign) => campaign.placement === placement)

    const categoryTaken: Record<string, number> = {}
    if (targeted) {
      for (const campaign of sold) {
        for (const slug of new Set(campaign.targetCategories ?? [])) {
          categoryTaken[slug] = (categoryTaken[slug] ?? 0) + 1
        }
      }
    }

    const sections =
      placement === 'section_ad'
        ? SECTION_SLOTS.map((slot) => {
            const taken = sold.filter((campaign) => campaign.sectionSlot === slot.id).length
            return { id: slot.id, label: slot.label, taken, open: Math.max(capacity - taken, 0) }
          })
        : undefined

    return {
      placement,
      label: PLACEMENT_LABELS[placement],
      capacity,
      categoryTaken,
      ...(sections ? { sections } : {}),
      pages: pages.map((page) => {
        const taken = targeted && page !== 'site' ? sold.filter((c) => c.targetPages.includes(page)).length : sold.length
        return {
          page,
          label: SLOT_PAGE_LABELS[page],
          capacity,
          taken,
          open: Math.max(capacity - taken, 0),
        }
      }),
    }
  })
}

export const advertiserSlotService = {
  async availability(now: Date = new Date()): Promise<SlotAvailability[]> {
    const campaigns = await Campaign.find({
      status: { $in: COMMITTED_CAMPAIGN_STATUSES },
      endDate: { $gte: now },
    })
      .select('placement targetPages targetCategories sectionSlot')
      .lean<CommittedSlotCampaign[]>()

    return buildSlotAvailability(campaigns)
  },
}
