import { destroyAsset, uploadBuffer, type CloudinaryResourceType, type UploadedAsset } from '../../../storage/cloudinary.js'
import { deleteLocalAsset, saveLocally } from '../../../storage/local.js'
import { logger } from '../../../config/logger.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { mediaRepository } from '../repositories/media.repository.js'
import type { MediaDocument, MediaStorageProvider } from '../models/Media.js'

function resolveResourceType(mimetype: string): CloudinaryResourceType {
  if (mimetype.startsWith('video/')) return 'video'
  return 'image'
}

export const mediaService = {
  async uploadFile(file: Express.Multer.File, uploadedBy: string): Promise<MediaDocument> {
    const resourceType = resolveResourceType(file.mimetype)

    let asset: UploadedAsset
    let storage: MediaStorageProvider = 'cloudinary'
    try {
      asset = await uploadBuffer(file.buffer, resourceType)
    } catch (error) {
      logger.warn('Cloudinary upload failed — falling back to local backup storage.', error)
      asset = await saveLocally(file.buffer, file.mimetype, resourceType)
      storage = 'local'
    }

    return mediaRepository.create({
      url: asset.url,
      publicId: asset.publicId,
      storage,
      resourceType: asset.resourceType,
      format: asset.format,
      bytes: asset.bytes,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      uploadedBy,
    })
  },

  async deleteFile(id: string): Promise<void> {
    const media = await mediaRepository.findById(id)
    if (!media) {
      throw new AppError('Media not found.', 404)
    }

    if (media.storage === 'local') {
      await deleteLocalAsset(media.publicId)
    } else {
      await destroyAsset(media.publicId, media.resourceType)
    }
    await mediaRepository.deleteById(id)
  },
}
