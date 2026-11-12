import { Types } from 'mongoose'
import { AppError } from '../../../shared/errors/AppError.js'
import type { AdAssetDocument } from '../models/AdAsset.js'
import { adAssetRepository } from '../repositories/adAsset.repository.js'
import { campaignRepository } from '../repositories/campaign.repository.js'
import { removeAdvertiserImage, storeAdvertiserImage } from './advertiserMedia.service.js'

function notFound(): AppError {
  return new AppError('Image not found in your Ad Library.', 404)
}

function nameFromFile(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, '').trim()
  return (base || 'Untitled image').slice(0, 120)
}

export const advertiserLibraryService = {
  async list(advertiserId: string): Promise<Array<ReturnType<AdAssetDocument['toJSON']> & { usedBy: number }>> {
    const [assets, usage] = await Promise.all([
      adAssetRepository.list(advertiserId),
      campaignRepository.usageByAsset(advertiserId),
    ])
    return assets.map((asset) => ({ ...asset.toJSON(), usedBy: usage.get(String(asset._id)) ?? 0 }))
  },

  async upload(advertiserId: string, file: Express.Multer.File | undefined, name?: string): Promise<AdAssetDocument> {
    if (!file) throw new AppError('Please choose an image to upload.', 400)

    const stored = await storeAdvertiserImage(file)
    return adAssetRepository.create({
      advertiser: new Types.ObjectId(advertiserId),
      name: name?.trim().slice(0, 120) || nameFromFile(file.originalname),
      url: stored.url,
      publicId: stored.publicId,
      storage: stored.storage,
      format: stored.format,
      bytes: stored.bytes,
      width: stored.width,
      height: stored.height,
    })
  },

  async rename(advertiserId: string, id: string, name: string): Promise<AdAssetDocument> {
    if (!Types.ObjectId.isValid(id)) throw notFound()
    const asset = await adAssetRepository.rename(advertiserId, id, name)
    if (!asset) throw notFound()
    return asset
  },

  // A live ad must never lose its image, so deletion is refused while a running, paused or in-review campaign uses it.
  async remove(advertiserId: string, id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) throw notFound()
    const asset = await adAssetRepository.findOwnedWithStorage(advertiserId, id)
    if (!asset) throw notFound()

    const live = await campaignRepository.countLiveUsingAsset(advertiserId, id)
    if (live > 0) {
      throw new AppError(
        `This image is used by ${live} live campaign${live === 1 ? '' : 's'}. Pause and edit ${live === 1 ? 'it' : 'them'} to use another image first.`,
        409,
      )
    }

    await campaignRepository.detachAsset(advertiserId, id)
    await adAssetRepository.deleteOwned(advertiserId, id)
    await removeAdvertiserImage(asset.publicId, asset.storage)
  },
}
