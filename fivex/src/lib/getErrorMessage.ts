import { isAxiosError } from 'axios'

/**
 * Extracts a human-readable message from an error thrown by an API call.
 * The backend's errorHandler always responds with `{ message: string }`,
 * so we prefer that over axios's generic "Request failed with status code X".
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message
    if (message) return message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
