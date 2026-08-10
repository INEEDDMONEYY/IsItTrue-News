import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { env } from '../config/env.js'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

export type CloudinaryResourceType = 'image' | 'video'

export interface UploadedAsset {
  url: string
  publicId: string
  resourceType: CloudinaryResourceType
  format: string
  bytes: number
  width?: number
  height?: number
  duration?: number
}

/**
 * Streams an in-memory file buffer up to Cloudinary. Used instead of a
 * disk-based multer storage engine so nothing touches the local filesystem.
 */
export function uploadBuffer(buffer: Buffer, resourceType: CloudinaryResourceType): Promise<UploadedAsset> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `isittrue/${resourceType}s`,
        resource_type: resourceType,
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'))
          return
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          duration: result.duration,
        })
      },
    )

    uploadStream.end(buffer)
  })
}

export async function destroyAsset(publicId: string, resourceType: CloudinaryResourceType): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}
