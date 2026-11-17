import { createHmac } from 'node:crypto'
import { env } from '../../../config/env.js'

// Unique-visitor identity. The key is derived from a secret, so the hash can't be reversed to an IP address and
// can't be recomputed by someone who only knows the IP. The UTC day is part of the input, so the same reader gets
// a new hash each day.
const visitorKey =
  env.ANALYTICS_VISITOR_SECRET ??
  createHmac('sha256', env.JWT_ACCESS_SECRET).update('isittrue:analytics-visitor:v1').digest('hex')

export function utcDayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function visitorHash(ip: string | undefined, userAgent: string | undefined, date: Date = new Date()): string {
  return createHmac('sha256', visitorKey)
    .update(`${utcDayKey(date)}|${ip ?? ''}|${userAgent ?? ''}`)
    .digest('hex')
    .slice(0, 32)
}

// Keeps only the referring hostname (no path or query string, which can carry personal data). Returns undefined
// when there is no referrer or the value isn't a valid URL.
export function referrerHostFrom(referer: string | undefined): string | undefined {
  if (!referer) return undefined
  try {
    const host = new URL(referer).hostname.toLowerCase().replace(/^www\./, '')
    return host ? host.slice(0, 253) : undefined
  } catch {
    return undefined
  }
}
