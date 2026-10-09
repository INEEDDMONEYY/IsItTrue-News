import multer from 'multer'
import { AppError } from '../shared/errors/AppError.js'

// 25MB was fine for images but rejected almost every real (uncompressed)
// video clip — raised to match Cloudinary's free-tier video upload cap.
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024 // 100MB

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

// Open to any signed-in user (e.g. readers mid-onboarding), so images only and a tight size cap.
export const profilePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true)
      return
    }
    callback(new AppError('Only image files are allowed.', 400))
  },
})
