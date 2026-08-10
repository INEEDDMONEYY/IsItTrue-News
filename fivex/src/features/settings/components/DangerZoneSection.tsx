import { useState } from 'react'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useDeleteOwnAccount } from '../hooks/useAccountSettings'

export function DangerZoneSection() {
  const [confirmText, setConfirmText] = useState('')
  const { mutate, isPending, error } = useDeleteOwnAccount()

  const handleDelete = () => {
    if (confirmText !== 'DELETE') return
    mutate()
  }

  return (
    <section className="rounded-2xl border border-disputed/30 bg-card p-5">
      <h2 className="text-sm font-semibold text-disputed mb-1">Danger zone</h2>
      <p className="text-xs text-card-text-muted mb-4">
        Permanently delete your account. This cannot be undone. If you are the last admin,
        promote another account to admin first.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end max-w-lg">
        <div className="flex-1">
          <label className="block text-xs text-card-text-muted mb-1.5" htmlFor="confirm-delete">
            Type DELETE to confirm
          </label>
          <input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-card text-sm text-card-heading focus:outline-none focus:ring-2 focus:ring-accent-border"
          />
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={confirmText !== 'DELETE' || isPending}
          className="px-4 py-2.5 rounded-xl bg-disputed text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {isPending ? 'Deleting...' : 'Delete my account'}
        </button>
      </div>

      {error && <p className="text-sm text-disputed mt-3">{getErrorMessage(error)}</p>}
    </section>
  )
}
