import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import dayjs from '@/lib/dayjs'
import { mockNewsletters } from '../data/mockNewsletters'

export function NewslettersPage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (event: FormEvent) => {
    event.preventDefault()
    if (!email) return
    setSubscribed(true)
  }

  return (
    <div className="py-6 md:py-10 flex flex-col gap-8">
      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent-bg flex items-center justify-center">
          <Mail className="w-5 h-5 text-accent" />
        </div>
        <h1 className="text-2xl font-semibold text-heading">The IsItTrue Newsletter</h1>
        <p className="text-sm text-text-muted max-w-md">
          Verified stories and fact checks, delivered straight to your inbox.
        </p>

        {subscribed ? (
          <p className="text-sm text-accent font-medium">
            You're subscribed. Check your inbox to confirm.
          </p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex w-full max-w-sm gap-2 mt-2">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-heading text-bg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-heading mb-4">Past editions</h2>
        <div className="flex flex-col gap-3">
          {mockNewsletters.map((edition) => (
            <div
              key={edition.id}
              className="rounded-xl border border-card-border bg-card p-4 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-card-heading">{edition.title}</h3>
                <span className="text-[11px] uppercase tracking-wide text-card-text-dim shrink-0">
                  {edition.frequency}
                </span>
              </div>
              <p className="text-sm text-card-text-muted">{edition.summary}</p>
              <p className="text-xs text-card-text-dim">
                {dayjs(edition.publishedAt).format('MMM D, YYYY')} · {edition.readTime} min read
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
