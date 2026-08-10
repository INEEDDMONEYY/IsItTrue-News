import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../shared/errors/AppError.js'
import type { Role } from '../shared/constants/roles.js'

/**
 * Restricts a route to one or more roles. Must run after `authenticate`.
 * This is what stops a regular reader account from ever reaching admin-only
 * endpoints, even if they somehow obtain a valid (non-admin) access token —
 * the role is read from the signed JWT payload, not from anything the client sends.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('You must be signed in to access this resource.', 401))
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('You do not have permission to access this resource.', 403))
      return
    }

    next()
  }
}
