import { useEffect, useState, type FormEvent } from 'react'
import { MailCheck } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useForgotPassword } from '../hooks/useForgotPassword'

// The server quietly ignores a second request inside this window, so the button waits it out.
const RESEND_COOLDOWN_SECONDS = 60

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [sentAt, setSentAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const { mutate, isPending, error, reset } = useForgotPassword()

  useEffect(() => {
    if (!sentTo) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [sentTo, sentAt])

  const send = (address: string) => {
    mutate(address, {
      onSuccess: () => {
        const sentNow = Date.now()
        setSentTo(address)
        setSentAt(sentNow)
        setNow(sentNow)
      },
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (isPending) return
    send(email.trim())
  }

  if (sentTo) {
    const secondsLeft = Math.max(0, RESEND_COOLDOWN_SECONDS - Math.floor((now - sentAt) / 1000))

    return (
      <div className="flex flex-col gap-4">
        <div role="status" className="flex items-start gap-3 rounded-xl border border-verified/30 bg-verified/10 p-4">
          <MailCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-verified" />
          <div className="text-sm">
            <p className="font-semibold text-heading">Check your email</p>
            <p className="mt-1 text-text-muted">
              If an account exists for <span className="font-medium text-heading break-all">{sentTo}</span>, we&apos;ve
              sent a link to reset its password. It can take a minute or two to arrive, so check your spam folder too.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-disputed">
            {getErrorMessage(error, 'We couldn’t send that. Please try again.')}
          </p>
        )}

        <button
          type="button"
          onClick={() => send(sentTo)}
          disabled={isPending || secondsLeft > 0}
          className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-heading hover:border-accent-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Sending...' : secondsLeft > 0 ? `Send again in ${secondsLeft}s` : 'Send the link again'}
        </button>

        <button
          type="button"
          onClick={() => {
            reset()
            setSentTo(null)
          }}
          className="text-sm text-accent hover:text-accent-hover"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-text-muted mb-1.5" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-disputed">
          {getErrorMessage(error, 'We couldn’t send that. Please try again.')}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !email.trim()}
        className="w-full py-2.5 rounded-xl bg-heading text-bg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? 'Sending...' : 'Send reset link'}
      </button>
    </form>
  )
}
