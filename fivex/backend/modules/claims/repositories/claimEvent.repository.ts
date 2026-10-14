import { ClaimEvent, type IClaimEvent, type ClaimEventDocument } from '../models/ClaimEvent.js'

export type NewClaimEvent = Omit<IClaimEvent, 'createdAt'>

// Deliberately only create and read: the history of a claim must not be editable.
export const claimEventRepository = {
  async record(event: NewClaimEvent): Promise<void> {
    await ClaimEvent.create(event)
  },

  async findByClaim(claimId: string, limit: number): Promise<ClaimEventDocument[]> {
    return ClaimEvent.find({ claim: claimId }).sort({ createdAt: -1, _id: -1 }).limit(limit)
  },

  async countByClaim(claimId: string): Promise<number> {
    return ClaimEvent.countDocuments({ claim: claimId })
  },
}
