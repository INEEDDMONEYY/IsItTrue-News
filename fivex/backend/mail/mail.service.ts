import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import {
  isMailConfigured,
  sendWithUnosend,
  type MailMessage,
  type MailReceipt,
} from './providers/unosend.provider.js'
import { verificationEmailTemplate } from './templates/verificationEmail.js'
import { waitlistWelcomeTemplate } from './templates/waitlistWelcome.js'
import { passwordResetTemplate } from './templates/passwordReset.js'
import { passwordChangedTemplate } from './templates/passwordChanged.js'

export type EmailTemplate = Pick<MailMessage, 'subject' | 'html' | 'text'>

// Resolves to null when no provider key is configured and the message was only logged (local dev).
async function deliver(message: MailMessage): Promise<MailReceipt | null> {
  if (!isMailConfigured()) {
    logger.info(`(dev) Email logged instead of sent → to=${message.to} subject="${message.subject}"`)
    return null
  }

  return sendWithUnosend(message)
}

export const mailService = {
  isConfigured: isMailConfigured,

  // Sends any rendered template (see templates/layout.ts) — new emails only need a template.
  sendTemplated(to: string, template: EmailTemplate, options: Pick<MailMessage, 'priority' | 'replyTo'> = {}) {
    return deliver({ to, ...template, ...options })
  },

  async sendVerificationEmail(params: { name: string; email: string; token: string }): Promise<MailReceipt | null> {
    const verificationUrl = `${env.APP_URL}/verify-email?token=${encodeURIComponent(params.token)}`
    const template = verificationEmailTemplate({
      name: params.name,
      verificationUrl,
      expiresInMinutes: env.EMAIL_VERIFICATION_EXPIRES_IN_MINUTES,
    })

    // One-time links should arrive fast.
    return this.sendTemplated(params.email, template, { priority: 'high' })
  },

  async sendWaitlistWelcomeEmail(params: { name?: string; email: string }): Promise<MailReceipt | null> {
    return this.sendTemplated(params.email, waitlistWelcomeTemplate({ name: params.name }))
  },

  async sendPasswordResetEmail(params: { name: string; email: string; token: string }): Promise<MailReceipt | null> {
    const resetUrl = `${env.APP_URL}/reset-password?token=${encodeURIComponent(params.token)}`
    const template = passwordResetTemplate({
      name: params.name,
      resetUrl,
      expiresInMinutes: env.PASSWORD_RESET_EXPIRES_IN_MINUTES,
    })

    return this.sendTemplated(params.email, template, { priority: 'high' })
  },

  async sendPasswordChangedEmail(params: { name: string; email: string }): Promise<MailReceipt | null> {
    const template = passwordChangedTemplate({
      name: params.name,
      signInUrl: `${env.APP_URL}/login`,
      resetUrl: `${env.APP_URL}/forgot-password`,
    })

    return this.sendTemplated(params.email, template, { priority: 'high' })
  },
}
