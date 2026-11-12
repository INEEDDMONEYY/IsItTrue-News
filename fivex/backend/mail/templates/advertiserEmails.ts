import { renderEmail } from './layout.js'

// Advertiser accounts are separate from reader accounts, so their emails say so and link to the advertiser portal.

export function advertiserVerificationTemplate(params: {
  businessName: string
  verificationUrl: string
  expiresInMinutes: number
}) {
  const { html, text } = renderEmail({
    preheader: 'Confirm your email address to finish creating your advertiser account.',
    heading: 'Verify your email',
    greeting: `Hi ${params.businessName},`,
    paragraphs: ['Please confirm your email address to finish creating your IsItTrue News advertiser account.'],
    action: { label: 'Verify email', url: params.verificationUrl },
    footnote: `This link expires in ${params.expiresInMinutes} minutes. If you didn't create an advertiser account, you can safely ignore this email.`,
  })

  return { subject: 'Verify your email for the IsItTrue News advertiser portal', html, text }
}

export function advertiserPasswordResetTemplate(params: {
  businessName: string
  resetUrl: string
  expiresInMinutes: number
}) {
  const { html, text } = renderEmail({
    preheader: 'Use this link to choose a new password.',
    heading: 'Reset your password',
    greeting: `Hi ${params.businessName},`,
    paragraphs: ['We received a request to reset the password for your IsItTrue News advertiser account.'],
    action: { label: 'Choose a new password', url: params.resetUrl },
    footnote: `This link expires in ${params.expiresInMinutes} minutes and can be used once. If you didn't ask for this, you can safely ignore this email. Your password won't change.`,
  })

  return { subject: 'Reset your IsItTrue News advertiser password', html, text }
}

export function advertiserPasswordChangedTemplate(params: {
  businessName: string
  signInUrl: string
  resetUrl: string
}) {
  const { html, text } = renderEmail({
    preheader: 'Your advertiser account password was just changed.',
    heading: 'Your password was changed',
    greeting: `Hi ${params.businessName},`,
    paragraphs: [
      'The password for your IsItTrue News advertiser account was just changed, and every device was signed out.',
      `If this wasn't you, reset your password again right away using ${params.resetUrl} and reply to this email so we can look into it.`,
    ],
    action: { label: 'Sign in', url: params.signInUrl },
  })

  return { subject: 'Your IsItTrue News advertiser password was changed', html, text }
}
