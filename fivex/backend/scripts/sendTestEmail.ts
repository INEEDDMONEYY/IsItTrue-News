/**
 * Sends a real test email through the configured provider, using the same signup template
 * visitors receive (subject prefixed with "[Test]").
 *
 * Usage:
 *   npm run mail:test -- someone@example.com ["Recipient Name"]
 *
 * Unlike the app itself, this refuses to fall back to console logging: if the provider is not
 * configured or rejects the message, it exits non-zero so you find out immediately.
 */
import { z } from 'zod'
import { env } from '../config/env.js'
import { mailService } from '../mail/mail.service.js'
import { MailDeliveryError } from '../mail/providers/unosend.provider.js'
import { waitlistWelcomeTemplate } from '../mail/templates/waitlistWelcome.js'

async function main() {
  const [recipientArg, nameArg] = process.argv.slice(2)

  const parsed = z.string().trim().email().safeParse(recipientArg)
  if (!parsed.success) {
    console.error('Usage: npm run mail:test -- <recipient email> ["Recipient Name"]')
    process.exit(1)
  }

  if (!mailService.isConfigured()) {
    console.error('UNOSEND_API_KEY is not set in .env, so nothing would be sent. Add it and try again.')
    process.exit(1)
  }

  const template = waitlistWelcomeTemplate({ name: nameArg?.trim() || undefined })
  const receipt = await mailService.sendTemplated(parsed.data, {
    ...template,
    subject: `[Test] ${template.subject}`,
  })

  console.log(`Accepted by Unosend → id=${receipt?.id} status=${receipt?.status}`)
  console.log(`  from:     ${env.MAIL_FROM}`)
  console.log(`  reply-to: ${env.MAIL_REPLY_TO ?? '(none)'}`)
  console.log(`  to:   ${parsed.data}`)
}

main().catch((error: unknown) => {
  if (error instanceof MailDeliveryError) {
    console.error(`Send failed: ${error.message}${error.code ? ` (${error.code})` : ''}`)
  } else {
    console.error(error)
  }
  process.exit(1)
})
