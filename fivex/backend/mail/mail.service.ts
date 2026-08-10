import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { getUnsendClient } from './providers/unsend.provider.js'
import { verificationEmailTemplate } from './templates/verificationEmail.js'

interface SendMailInput {
  to: string
  subject: string
  html: string
  text: string
}

async function sendMail({ to, subject, html, text }: SendMailInput): Promise<void> {
  const client = getUnsendClient()

  if (!client) {
    logger.info(`(dev) Email logged instead of sent → to=${to} subject="${subject}"`)
    return
  }

  const { error } = await client.emails.send({
    from: env.MAIL_FROM,
    to,
    subject,
    html,
    text,
  })

  if (error) {
    logger.error(`Failed to send email via Unsend → to=${to} subject="${subject}"`, error)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}


export const mailService = {
  async sendVerificationEmail(params: { name: string; email: string; token: string }): Promise<void> {
    const verificationUrl = `${env.APP_URL}/verify-email?token=${encodeURIComponent(params.token)}`
    const { subject, html, text } = verificationEmailTemplate({
      name: params.name,
      verificationUrl,
      expiresInMinutes: env.EMAIL_VERIFICATION_EXPIRES_IN_MINUTES,
    })

    await sendMail({ to: params.email, subject, html, text })
  },
}
