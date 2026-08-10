import { destroyAsset, uploadBuffer, type CloudinaryResourceType } from '../../../storage/cloudinary.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { mediaRepository } from '../repositories/media.repository.js'
import type { MediaDocument } from '../models/Media.js'

function resolveResourceType(mimetype: string): CloudinaryResourceType {
  if (mimetype.startsWith('video/')) return 'video'
  return 'image'
}

export const mediaService = {
  async uploadFile(file: Express.Multer.File, uploadedBy: string): Promise<MediaDocument> {
    const resourceType = resolveResourceType(file.mimetype)
    const asset = await uploadBuffer(file.buffer, resourceType)

    return mediaRepository.create({
      url: asset.url,
      publicId: asset.publicId,
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

    await destroyAsset(media.publicId, media.resourceType)
    await mediaRepository.deleteById(id)
  },
}
