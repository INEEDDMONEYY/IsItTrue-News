import { useState, type FormEvent } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useChangeEmail } from '../hooks/useAccountSettings'

export function ChangeEmailSection() {
  const { user } = useAuth()
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const { mutate, isPending, error, isSuccess, reset } = useChangeEmail()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutate(
      { newEmail, currentPassword },
      {
        onSuccess: () => {
          setNewEmail('')
          setCurrentPassword('')
        },
      },
    )
  }

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-sm font-semibold text-card-heading mb-1">Email address</h2>
      <p className="text-xs text-card-text-muted mb-4">
        Current email: <span className="text-card-heading">{user?.email}</span>. Changing it
        will require re-verifying your new address before you can sign in again.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
        <div>
          <label className="block text-xs text-card-text-muted mb-1.5" htmlFor="newEmail">
            New email
          </label>
          <input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value)
              reset()
            }}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm text-card-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>
        <div>
          <label className="block text-xs text-card-text-muted mb-1.5" htmlFor="email-current-password">
            Current password
          </label>
          <input
            id="email-current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm text-card-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="self-start px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isPending ? 'Updating...' : 'Update email'}
        </button>
      </form>

      {error && <p className="text-sm text-disputed mt-3">{getErrorMessage(error)}</p>}
      {isSuccess && (
        <p className="text-sm text-verified mt-3">
          Email updated. Check your new inbox for a verification link.
        </p>
      )}
    </section>
  )
}
