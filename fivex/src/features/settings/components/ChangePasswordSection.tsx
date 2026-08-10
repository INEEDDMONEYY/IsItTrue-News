import { useState, type FormEvent } from 'react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useChangePassword } from '../hooks/useAccountSettings'

export function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const { mutate, isPending, error, isSuccess, reset } = useChangePassword()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (newPassword !== confirmPassword) {
      setFormError('New password and confirmation do not match.')
      return
    }

    mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        },
      },
    )
  }

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-sm font-semibold text-card-heading mb-1">Password</h2>
      <p className="text-xs text-card-text-muted mb-4">
        Update your password. Use at least 8 characters with a mix of upper and lowercase
        letters and a number.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
        <div>
          <label className="block text-xs text-card-text-muted mb-1.5" htmlFor="currentPassword">
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value)
              reset()
            }}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm text-card-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>
        <div>
          <label className="block text-xs text-card-text-muted mb-1.5" htmlFor="newPassword">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm text-card-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>
        <div>
          <label className="block text-xs text-card-text-muted mb-1.5" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm text-card-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="self-start px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isPending ? 'Updating...' : 'Update password'}
        </button>
      </form>

      {(formError || error) && (
        <p className="text-sm text-disputed mt-3">{formError ?? getErrorMessage(error)}</p>
      )}
      {isSuccess && <p className="text-sm text-verified mt-3">Password updated.</p>}
    </section>
  )
}
