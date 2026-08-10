import { useState, type FormEvent } from 'react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useCreateUser } from '../../hooks/useUserMutations'
import { USER_ROLE_OPTIONS, type UserRole } from '../../types/user.types'

const initialForm = { name: '', email: '', password: '', role: 'reader' as UserRole }

export function CreateUserSection() {
  const [form, setForm] = useState(initialForm)
  const { mutate, isPending, error, isSuccess, reset } = useCreateUser()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutate(form, {
      onSuccess: () => setForm(initialForm),
    })
  }

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    reset()
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-sm font-semibold text-card-heading mb-1">Create admins &amp; users</h2>
      <p className="text-xs text-card-text-muted mb-4">
        Add a new account directly with any role — useful for onboarding editors, authors, or
        other admins without them needing to self-register.
      </p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
        <div>
          <label className="block text-xs text-card-text-muted mb-1.5" htmlFor="new-user-name">
            Name
          </label>
          <input
            id="new-user-name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
            minLength={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm text-card-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>
        <div>
          <label className="block text-xs text-card-text-muted mb-1.5" htmlFor="new-user-email">
            Email
          </label>
          <input
            id="new-user-email"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm text-card-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>
        <div>
          <label className="block text-xs text-card-text-muted mb-1.5" htmlFor="new-user-password">
            Temporary password
          </label>
          <input
            id="new-user-password"
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            required
            minLength={8}
            className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm text-card-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>
        <div>
          <label className="block text-xs text-card-text-muted mb-1.5" htmlFor="new-user-role">
            Role
          </label>
          <select
            id="new-user-role"
            value={form.role}
            onChange={(e) => updateField('role', e.target.value as UserRole)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm text-card-heading capitalize focus:outline-none focus:ring-2 focus:ring-accent-border"
          >
            {USER_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="self-start sm:col-span-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isPending ? 'Creating...' : 'Create account'}
        </button>
      </form>

      {error && <p className="text-sm text-disputed mt-3">{getErrorMessage(error)}</p>}
      {isSuccess && <p className="text-sm text-verified mt-3">Account created successfully.</p>}
    </section>
  )
}
