export interface VerificationEmailParams {
  name: string
  verificationUrl: string
  expiresInMinutes: number
}

export function verificationEmailTemplate({ name, verificationUrl, expiresInMinutes }: VerificationEmailParams) {
  const subject = 'Verify your email for IsItTrue News'

  const text = `Hi ${name},\n\nPlease confirm your email address by opening this link:\n${verificationUrl}\n\nThis link expires in ${expiresInMinutes} minutes. If you didn't create an account, you can ignore this email.\n\n— IsItTrue News`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="margin-bottom: 8px;">Verify your email</h2>
      <p>Hi ${name},</p>
      <p>Please confirm your email address to finish creating your IsItTrue News account.</p>
      <p style="margin: 24px 0;">
        <a href="${verificationUrl}" style="background:#1d4ed8;color:#ffffff;padding:10px 20px;border-radius:9999px;text-decoration:none;display:inline-block;">
          Verify email
        </a>
      </p>
      <p style="font-size: 13px; color: #555;">This link expires in ${expiresInMinutes} minutes. If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `

  return { subject, text, html }
}
