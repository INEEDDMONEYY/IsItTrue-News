import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'

export type MailPriority = 'high' | 'normal' | 'low'

export interface MailMessage {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  priority?: MailPriority
}

export interface MailReceipt {
  id: string
  status: string
}

export class MailDeliveryError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'MailDeliveryError'
  }
}

interface UnosendResponse {
  success?: boolean
  data?: { id?: string; status?: string }
  error?: { code?: string; message?: string }
}

const REQUEST_TIMEOUT_MS = 15_000

/**
 * Unosend REST client (https://docs.unosend.co/api-reference/emails/send-email).
 */
export function isMailConfigured(): boolean {
  return Boolean(env.UNOSEND_API_KEY)
}

export async function sendWithUnosend(message: MailMessage): Promise<MailReceipt> {
  if (!env.UNOSEND_API_KEY) {
    throw new MailDeliveryError('UNOSEND_API_KEY is not configured.')
  }

  let response: Response
  try {
    response = await fetch(`${env.UNOSEND_BASE_URL.replace(/\/+$/, '')}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.UNOSEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        priority: message.priority ?? 'normal',
        // Transactional mail carries one-time links (e.g. email verification). Click tracking would
        // route those through a redirect domain, so it stays off; open tracking adds nothing here.
        tracking: { open: false, click: false },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new MailDeliveryError(`Could not reach the mail provider: ${reason}`)
  }

  const body = (await response.json().catch(() => ({}))) as UnosendResponse

  if (!response.ok || body.success === false || !body.data?.id) {
    const detail = body.error?.message ?? `HTTP ${response.status}`
    logger.error(
      `Unosend rejected an email → status=${response.status} code=${body.error?.code ?? 'unknown'} ` +
        `reason="${body.error?.message ?? 'none'}" from="${env.MAIL_FROM}"`,
    )
    throw new MailDeliveryError(`Failed to send email: ${detail}`, response.status, body.error?.code)
  }

  return { id: body.data.id, status: body.data.status ?? 'queued' }
}
