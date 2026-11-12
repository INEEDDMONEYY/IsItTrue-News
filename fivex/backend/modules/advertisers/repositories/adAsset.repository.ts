import { AdAsset, type AdAssetDocument, type IAdAsset } from '../models/AdAsset.js'

// Scoped to one advertiser throughout: an asset id belonging to someone else behaves as "not found".
export const adAssetRepository = {
  async list(advertiserId: string): Promise<AdAssetDocument[]> {
    return AdAsset.find({ advertiser: advertiserId }).sort({ createdAt: -1 }).limit(500)
  },

  async findOwned(advertiserId: string, id: string): Promise<AdAssetDocument | null> {
    return AdAsset.findOne({ _id: id, advertiser: advertiserId })
  },

  async findOwnedWithStorage(advertiserId: string, id: string): Promise<AdAssetDocument | null> {
    return AdAsset.findOne({ _id: id, advertiser: advertiserId }).select('+publicId +storage')
  },

  async create(asset: Omit<IAdAsset, 'createdAt' | 'updatedAt'>): Promise<AdAssetDocument> {
    return AdAsset.create(asset)
  },

  async rename(advertiserId: string, id: string, name: string): Promise<AdAssetDocument | null> {
    return AdAsset.findOneAndUpdate({ _id: id, advertiser: advertiserId }, { $set: { name } }, { new: true })
  },

  async deleteOwned(advertiserId: string, id: string): Promise<void> {
    await AdAsset.deleteOne({ _id: id, advertiser: advertiserId })
  },
}
