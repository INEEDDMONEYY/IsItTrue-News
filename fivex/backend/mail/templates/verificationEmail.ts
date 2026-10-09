import { renderEmail } from './layout.js'

export interface VerificationEmailParams {
  name: string
  verificationUrl: string
  expiresInMinutes: number
}

export function verificationEmailTemplate({ name, verificationUrl, expiresInMinutes }: VerificationEmailParams) {
  const { html, text } = renderEmail({
    preheader: 'Confirm your email address to finish creating your account.',
    heading: 'Verify your email',
    greeting: `Hi ${name},`,
    paragraphs: ['Please confirm your email address to finish creating your IsItTrue News account.'],
    action: { label: 'Verify email', url: verificationUrl },
    footnote: `This link expires in ${expiresInMinutes} minutes. If you didn't create an account, you can safely ignore this email.`,
  })

  return { subject: 'Verify your email for IsItTrue News', html, text }
}
