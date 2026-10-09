import { renderEmail } from './layout.js'

export interface WaitlistWelcomeParams {
  name?: string
}

export function waitlistWelcomeTemplate({ name }: WaitlistWelcomeParams) {
  const { html, text } = renderEmail({
    preheader: "Thanks for signing up. We'll email you as soon as your access opens.",
    heading: "You're on the list",
    greeting: name ? `Hi ${name},` : 'Hi,',
    paragraphs: [
      "Thanks for signing up for early access to IsItTrue News. You're on the list, and we'll email you as soon as your access opens.",
    ],
    footnote: "If you didn't sign up, you can safely ignore this email and you won't hear from us again.",
  })

  return { subject: "You're on the IsItTrue News list", html, text }
}
