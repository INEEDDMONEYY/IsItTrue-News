import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'
import { AppError } from '../shared/errors/AppError.js'

/**
 * Validates req.body against a Zod schema and replaces it with the parsed
 * (and coerced/trimmed) value. Rejects with a 400 AppError listing every issue.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
        .join('; ')
      next(new AppError(message, 400))
      return
    }

    req.body = result.data
    next()
  }
}
