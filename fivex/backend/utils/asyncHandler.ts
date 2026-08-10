import type { NextFunction, Request, RequestHandler, Response } from 'express'

/**
 * Wraps an async Express handler so rejected promises are forwarded to next(),
 * instead of needing a try/catch in every controller function.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next)
  }
}
