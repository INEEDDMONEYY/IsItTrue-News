import { renderEmail } from './layout.js'

export interface PasswordResetEmailParams {
  name: string
  resetUrl: string
  expiresInMinutes: number
}

export function passwordResetTemplate({ name, resetUrl, expiresInMinutes }: PasswordResetEmailParams) {
  const { html, text } = renderEmail({
    preheader: 'Use this link to choose a new password.',
    heading: 'Reset your password',
    greeting: `Hi ${name},`,
    paragraphs: ['We received a request to reset the password for your IsItTrue News account.'],
    action: { label: 'Choose a new password', url: resetUrl },
    footnote: `This link expires in ${expiresInMinutes} minutes and can be used once. If you didn't ask for this, you can safely ignore this email. Your password won't change.`,
  })

  return { subject: 'Reset your IsItTrue News password', html, text }
}
