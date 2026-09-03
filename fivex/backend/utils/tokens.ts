import { createHash, randomBytes, randomInt } from 'node:crypto'

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

/**
 * Generates a 6-digit numeric verification code (e.g. for phone verification),
 * plus a SHA-256 hash of it to store — same never-store-the-raw-value
 * principle as generateVerificationToken.
 */
export function generateVerificationCode(): { code: string; codeHash: string } {
  const code = String(randomInt(100000, 1000000))
  const codeHash = hashToken(code)
  return { code, codeHash }
}

