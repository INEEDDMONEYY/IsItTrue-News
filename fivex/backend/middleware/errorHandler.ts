import type { NextFunction, Request, Response } from 'express'
import { MulterError } from 'multer'
import { isProduction } from '../config/env.js'
import { logger } from '../config/logger.js'
import { AppError } from '../shared/errors/AppError.js'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  if (err instanceof MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File is too large.' : 'File upload failed. Please try again.'
    res.status(400).json({ message })
    return
  }

  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err)


  res.status(500).json({
    message: isProduction ? 'Something went wrong. Please try again later.' : String(err),
  })
}
