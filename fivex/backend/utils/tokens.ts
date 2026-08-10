import { createHash, randomBytes } from 'node:crypto'

/**
 * Generates a random token to email to the user, plus a SHA-256 hash of it to store
 * in the database. We never store the raw token — only its hash — so a leaked
 * database can't be used to forge email-verification links (same principle as
 * hashing passwords).
 */
export function generateVerificationToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  return { token, tokenHash }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
