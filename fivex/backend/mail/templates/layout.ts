export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface EmailAction {
  label: string
  url: string
}

export interface EmailLayoutInput {
  // Short preview text shown next to the subject in most inboxes.
  preheader?: string
  heading: string
  // Plain text, e.g. "Hi Jane,". Everything below is escaped, so pass user-supplied text freely.
  greeting?: string
  paragraphs: string[]
  action?: EmailAction
  // Small print under the button, e.g. "This link expires in 60 minutes."
  footnote?: string
}

export interface RenderedEmail {
  html: string
  text: string
}

const BRAND_NAME = 'IsItTrue News'
const ACCENT = '#2563eb'
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

function assertSafeUrl(url: string): string {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Email links must use http or https.')
  }
  return parsed.toString()
}

/**
 * The shared shell for every email the platform sends (signup confirmation, verification, and
 * whatever comes next), so they all look the same and are escaped the same way. Table-based layout
 * with inline styles because that is what mail clients render reliably.
 */
export function renderEmail(input: EmailLayoutInput): RenderedEmail {
  const action = input.action ? { label: input.action.label, url: assertSafeUrl(input.action.url) } : undefined
  const year = new Date().getFullYear()

  const textParts = [
    input.greeting,
    ...input.paragraphs,
    action ? `${action.label}: ${action.url}` : undefined,
    input.footnote,
    `— ${BRAND_NAME}`,
  ].filter((part): part is string => Boolean(part))
  const text = textParts.join('\n\n')

  const paragraphsHtml = input.paragraphs
    .map((paragraph) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3f3f46;">${escapeHtml(paragraph)}</p>`)
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(input.heading)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;">
    ${
      input.preheader
        ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(input.preheader)}</div>`
        : ''
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #e2e2e5;">
            <tr>
              <td style="padding:28px 32px 0;font-family:${FONT};">
                <span style="font-size:18px;font-weight:700;color:${ACCENT};">?</span>
                <span style="font-size:16px;font-weight:700;color:#0a0a0d;margin-left:4px;">${BRAND_NAME}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 8px;font-family:${FONT};">
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#0a0a0d;">${escapeHtml(input.heading)}</h1>
                ${input.greeting ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3f3f46;">${escapeHtml(input.greeting)}</p>` : ''}
                ${paragraphsHtml}
                ${
                  action
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                  <tr>
                    <td style="border-radius:9999px;background-color:${ACCENT};">
                      <a href="${escapeHtml(action.url)}" style="display:inline-block;padding:12px 24px;font-family:${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(action.label)}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#6b6b76;">If the button doesn't work, copy this link into your browser:<br /><a href="${escapeHtml(action.url)}" style="color:${ACCENT};word-break:break-all;">${escapeHtml(action.url)}</a></p>`
                    : ''
                }
                ${input.footnote ? `<p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#6b6b76;">${escapeHtml(input.footnote)}</p>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 28px;font-family:${FONT};font-size:12px;color:#8b8b96;border-top:1px solid #e2e2e5;">
                © ${year} ${BRAND_NAME}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { html, text }
}
