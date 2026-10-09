import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { env } from '../config/env.js'
import { AppError } from '../shared/errors/AppError.js'
import type { CloudinaryResourceType, UploadedAsset } from './cloudinary.js'

/** Public URL prefix — lives under /api so the Vite dev proxy forwards it too. */
export const LOCAL_UPLOAD_URL_PREFIX = '/api/uploads'

export const LOCAL_UPLOAD_ROOT = path.resolve(env.UPLOAD_DIR)

// Allow-list only: SVG and other scriptable types must never be served from our own origin.
const EXTENSION_BY_MIMETYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}

/** Backup storage used when Cloudinary is unavailable. */
export async function saveLocally(
  buffer: Buffer,
  mimetype: string,
  resourceType: CloudinaryResourceType,
): Promise<UploadedAsset> {
  const extension = EXTENSION_BY_MIMETYPE[mimetype]
  if (!extension) {
    throw new AppError('This file type cannot be stored right now. Please try a JPG, PNG, WebP, MP4 or WebM file.', 503)
  }

  const publicId = `${resourceType}s/${randomUUID()}.${extension}`
  const filePath = path.join(LOCAL_UPLOAD_ROOT, publicId)

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, buffer)

  return {
    url: `${LOCAL_UPLOAD_URL_PREFIX}/${publicId}`,
    publicId,
    resourceType,
    format: extension,
    bytes: buffer.length,
  }
}

export async function deleteLocalAsset(publicId: string): Promise<void> {
  const filePath = path.resolve(LOCAL_UPLOAD_ROOT, publicId)
  if (!filePath.startsWith(LOCAL_UPLOAD_ROOT + path.sep)) {
    throw new AppError('Invalid media path.', 400)
  }

  try {
    await unlink(filePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}
