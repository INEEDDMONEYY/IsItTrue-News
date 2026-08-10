import multer from 'multer'
import { AppError } from '../shared/errors/AppError.js'

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25MB

/**
 * In-memory storage — files are streamed straight to Cloudinary and never
 * touch the local filesystem (see backend/storage/cloudinary.ts).
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter(_req, file, callback) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      callback(null, true)
      return
    }
    callback(new AppError('Only image or video files are allowed.', 400))
  },
})
