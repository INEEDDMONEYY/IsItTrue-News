/**
 * Operational error that is safe to expose to API consumers (status + message).
 * Thrown deliberately from services/controllers; distinguishes expected failures
 * (validation, not found, conflict) from unexpected bugs in the error handler.
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}
