import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { prelaunchApi, type WaitlistInterest } from '../api/prelaunch.api'

const INTEREST_OPTIONS: { value: WaitlistInterest; label: string }[] = [
  { value: 'reader', label: 'Reading the news' },
  { value: 'author', label: 'Writing as an author' },
  { value: 'editor', label: 'Editing and fact-checking' },
  { value: 'organization', label: 'My organization' },
]

const fieldClass =
  'mt-1 block w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm text-heading placeholder:text-text-dim focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [interest, setInterest] = useState<WaitlistInterest | ''>('')

  const mutation = useMutation({ mutationFn: prelaunchApi.joinWaitlist })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (mutation.isPending) return
    mutation.mutate({
      email: email.trim(),
      ...(name.trim() ? { name: name.trim() } : {}),
      ...(interest ? { interest } : {}),
    })
  }

  if (mutation.isSuccess) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-2xl border border-verified/30 bg-verified/10 p-5 text-left">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-verified" />
        <div>
          <p className="font-semibold text-heading">You&apos;re on the list.</p>
          <p className="mt-1 text-sm text-text-muted">
            We&apos;ve sent a confirmation to <span className="font-medium text-heading">{email.trim()}</span>, and we&apos;ll
            email you again as soon as your access opens.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="w-full text-left">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-text-muted sm:col-span-2">
          Email address
          <input
            className={fieldClass}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={254}
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="block text-xs font-medium text-text-muted">
          Name <span className="text-text-dim">(optional)</span>
          <input
            className={fieldClass}
            type="text"
            name="name"
            autoComplete="name"
            maxLength={80}
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="block text-xs font-medium text-text-muted">
          I&apos;m interested in <span className="text-text-dim">(optional)</span>
          <select
            className={fieldClass}
            name="interest"
            value={interest}
            onChange={(event) => setInterest(event.target.value as WaitlistInterest | '')}
          >
            <option value="">Select one…</option>
            {INTEREST_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {mutation.isError && (
        <p role="alert" className="mt-3 text-sm text-disputed">
          {getErrorMessage(mutation.error, 'We couldn’t add you to the list. Please try again.')}
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending || !email.trim()}
        className="mt-4 w-full rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-on-brand transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? 'Adding you…' : 'Request early access'}
      </button>
      <p className="mt-3 text-center text-xs text-text-dim">
        We&apos;ll only use your email to tell you when access opens. No spam, and no sharing.
      </p>
    </form>
  )
}
