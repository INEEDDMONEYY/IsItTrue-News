import { Unsend } from 'unsend'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'

let client: Unsend | null = null

/**
 * Lazily creates the Unsend client. If no API key is configured (typical for
 * local development), returns null so the caller can log the message instead
 * of attempting a real send.
 */
export function getUnsendClient(): Unsend | null {
  if (client) return client

  if (!env.UNSEND_API_KEY) {
    logger.warn('UNSEND_API_KEY is not configured — emails will be logged to the console instead of sent.')
    return null
  }

  client = new Unsend(env.UNSEND_API_KEY, env.UNSEND_BASE_URL)
  return client
}
