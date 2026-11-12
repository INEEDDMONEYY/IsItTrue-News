import { logger } from '../../../config/logger.js'
import { destroyAsset, uploadBuffer } from '../../../storage/cloudinary.js'
import { deleteLocalAsset, saveLocally } from '../../../storage/local.js'

export interface StoredImage {
  url: string
  publicId: string
  storage: 'cloudinary' | 'local'
  format: string
  bytes: number
  width?: number
  height?: number
}

// Same Cloudinary-first, local-backup behaviour as the newsroom media library.
export async function storeAdvertiserImage(file: Express.Multer.File): Promise<StoredImage> {
  try {
    const asset = await uploadBuffer(file.buffer, 'image')
    return { ...asset, storage: 'cloudinary' }
  } catch (error) {
    logger.warn('Cloudinary upload failed for an advertiser image, falling back to local backup storage.', error)
    const asset = await saveLocally(file.buffer, file.mimetype, 'image')
    return { ...asset, storage: 'local' }
  }
}

// Best effort: a file left behind in storage must not block the advertiser's action.
export async function removeAdvertiserImage(publicId: string, storage: 'cloudinary' | 'local'): Promise<void> {
  try {
    if (storage === 'local') {
      await deleteLocalAsset(publicId)
    } else {
      await destroyAsset(publicId, 'image')
    }
  } catch (error) {
    logger.warn(`Could not delete advertiser image ${publicId} from ${storage} storage.`, error)
  }
}
