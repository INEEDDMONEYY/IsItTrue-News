import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, LifeBuoy } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useSubmitTicket } from '../hooks/useTickets'
import { getErrorMessage } from '@/lib/getErrorMessage'

export function SubmitTicketPage() {
  const { user } = useAuth()
  const { submitTicket, isSubmitting, isSubmitted, reset } = useSubmitTicket()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    try {
      await submitTicket({
        submittedByName: name.trim(),
        submittedByEmail: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      })
      setSubject('')
      setMessage('')
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to submit your ticket. Please try again.'))
    }
  }

  return (
    <div className="max-w-[640px] mx-auto py-10 md:py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to home
      </Link>

      <h1 className="text-3xl md:text-4xl font-semibold text-heading mb-2">Submit a Ticket</h1>
      <p className="text-base text-text leading-relaxed mb-8">
        Having trouble with your account, an article, or something else on the site? Let us know
        and our support team will get back to you.
      </p>

      {isSubmitted ? (
        <div className="rounded-2xl border border-verified/30 bg-verified/10 p-6">
          <p className="text-sm font-medium text-verified mb-1">Ticket submitted</p>
          <p className="text-sm text-text-muted mb-4">
            Thanks for reaching out — we&apos;ll follow up at the email address you provided.
          </p>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            Submit another ticket
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-muted mb-1.5" htmlFor="name">
                Your name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly describe the issue"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border"
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's going on"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-bg text-sm text-heading placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent-border resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !email.trim() || !subject.trim() || !message.trim()}
            className="self-start inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            <LifeBuoy className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit ticket'}
          </button>

          {formError && <p className="text-sm text-disputed">{formError}</p>}
        </form>
      )}
    </div>
  )
}
