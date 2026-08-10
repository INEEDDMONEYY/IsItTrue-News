import { resolveMx } from 'node:dns/promises'
import { AppError } from '../shared/errors/AppError.js'

/**
 * Anti-spoofing email checks for signup.
 *
 * True SMTP-level spoofing (forging the "From" header of outgoing mail) is stopped by
 * SPF/DKIM/DMARC records on the sending domain, not by application code. What we *can*
 * control here is making sure an attacker can't register an account using an email
 * address they don't own or a throwaway/fake domain:
 *   1. Strict format validation.
 *   2. Reject known disposable/temporary-inbox domains.
 *   3. Confirm the domain actually has mail servers (MX lookup) before we bother sending.
 *   4. The account stays unverified (and unusable) until the owner clicks the link we
 *      email them — this is the real proof that the signup email belongs to the signer.
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

// Small curated set of widely-used disposable/temporary email providers.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.info',
  'tempmail.com',
  'temp-mail.org',
  'yopmail.com',
  'trashmail.com',
  'throwawaymail.com',
  'getnada.com',
  'sharklasers.com',
  'dispostable.com',
  'maildrop.cc',
  'fakeinbox.com',
])

export function isValidEmailFormat(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

export function isDisposableEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain ? DISPOSABLE_EMAIL_DOMAINS.has(domain) : true
}

export async function domainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split('@')[1]
  if (!domain) return false

  try {
    const records = await resolveMx(domain)
    return records.length > 0
  } catch {
    // NXDOMAIN, ENODATA, timeouts, etc. all mean the domain cannot receive mail.
    return false
  }
}

/**
 * Throws an AppError (400) if the email fails any anti-spoofing check.
 * Call this before creating a user or sending any email.
 */
export async function assertDeliverableEmail(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase()

  if (!isValidEmailFormat(normalized)) {
    throw new AppError('Please provide a valid email address.', 400)
  }

  if (isDisposableEmailDomain(normalized)) {
    throw new AppError('Disposable or temporary email addresses are not allowed.', 400)
  }

  const acceptsMail = await domainAcceptsMail(normalized)
  if (!acceptsMail) {
    throw new AppError('We could not verify that this email domain can receive mail.', 400)
  }
}
