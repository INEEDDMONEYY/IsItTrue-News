import { useState, type FormEvent } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useUpdateName } from '../hooks/useAccountSettings'

export function ProfileNameSection() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const { mutate, isPending, error, isSuccess } = useUpdateName()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutate({ name })
  }

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-sm font-semibold text-card-heading mb-1">Profile</h2>
      <p className="text-xs text-card-text-muted mb-4">Update your display name.</p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end max-w-lg">
        <div className="flex-1">
          <label className="block text-xs text-card-text-muted mb-1.5" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm text-card-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save'}
        </button>
      </form>

      {error && <p className="text-sm text-disputed mt-3">{getErrorMessage(error)}</p>}
      {isSuccess && <p className="text-sm text-verified mt-3">Name updated.</p>}
    </section>
  )
}
