import { renderEmail } from './layout.js'

export interface PasswordChangedEmailParams {
  name: string
  signInUrl: string
  resetUrl: string
}

// Sent after a successful reset so the owner notices if someone else did it.
export function passwordChangedTemplate({ name, signInUrl, resetUrl }: PasswordChangedEmailParams) {
  const { html, text } = renderEmail({
    preheader: 'Your IsItTrue News password was just changed.',
    heading: 'Your password was changed',
    greeting: `Hi ${name},`,
    paragraphs: [
      'The password for your IsItTrue News account was just changed, and you can now sign in with the new one.',
      `If this wasn't you, reset your password again right away using ${resetUrl} and reply to this email so we can look into it.`,
    ],
    action: { label: 'Sign in', url: signInUrl },
  })

  return { subject: 'Your IsItTrue News password was changed', html, text }
}
