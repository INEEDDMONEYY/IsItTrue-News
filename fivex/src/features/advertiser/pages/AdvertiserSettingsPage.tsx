import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAdvertiserAuth } from '@/app/providers/AdvertiserAuthProvider'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { advertiserApi } from '../api/advertiser.api'
import { AdvertiserPageHeader } from '../components/AdvertiserPageHeader'
import type { AdvertiserAccount, AdvertiserNotifications } from '../types/advertiser.types'
import { formatDate } from '../utils/format'
import { getPasswordProblem, PASSWORD_HINT } from '../utils/passwordRules'

const DEFAULT_NOTIFICATIONS: AdvertiserNotifications = { campaignStatus: true, weeklyReport: false, billing: true }

const NOTIFICATION_OPTIONS: Array<{ key: keyof AdvertiserNotifications; label: string; description: string }> = [
  { key: 'campaignStatus', label: 'Campaign status', description: 'When a campaign is approved, rejected, starts or ends.' },
  { key: 'weeklyReport', label: 'Weekly performance report', description: 'A weekly summary of impressions and clicks.' },
  { key: 'billing', label: 'Billing', description: 'Budget and invoice updates for your account.' },
]

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-heading placeholder:text-text-dim focus:border-accent focus:outline-none'

function NotificationsCard({ account, onChange }: { account: AdvertiserAccount; onChange: (account: AdvertiserAccount) => void }) {
  const current = account.notifications ?? DEFAULT_NOTIFICATIONS
  const save = useMutation({ mutationFn: advertiserApi.updateNotifications, onSuccess: onChange })

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold text-heading">Email notifications</h2>
      <p className="mt-1 text-sm text-text-muted">Sent to {account.email}. Security emails are always sent.</p>

      <ul className="mt-5 divide-y divide-border">
        {NOTIFICATION_OPTIONS.map((option) => {
          const checked = current[option.key]
          return (
            <li key={option.key} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p id={`notif-${option.key}`} className="text-sm font-medium text-heading">
                  {option.label}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">{option.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-labelledby={`notif-${option.key}`}
                disabled={save.isPending}
                onClick={() => save.mutate({ ...current, [option.key]: !checked })}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-60 ${
                  checked ? 'bg-accent' : 'bg-surface-2'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </button>
            </li>
          )
        })}
      </ul>
      {save.isError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {getErrorMessage(save.error, 'Could not update notifications.')}
        </p>
      )}
    </section>
  )
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const change = useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) => advertiserApi.changePassword(current, next),
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    const problem = getPasswordProblem(newPassword)
    if (problem) return setError(problem)
    if (newPassword !== confirmPassword) return setError('Your new passwords do not match.')
    if (newPassword === currentPassword) return setError('Your new password must be different from the current one.')

    change.mutate(
      { current: currentPassword, next: newPassword },
      {
        onSuccess: (message) => {
          setSuccess(message)
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        },
        onError: (err) => setError(getErrorMessage(err, 'Could not change your password.')),
      },
    )
  }

  const type = show ? 'text' : 'password'

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-heading">Change password</h2>
          <p className="mt-1 text-sm text-text-muted">Changing your password signs out your other devices.</p>
        </div>
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-text-muted hover:bg-surface"
          aria-pressed={show}
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {show ? 'Hide' : 'Show'}
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:max-w-md">
        <label className="block text-sm font-medium text-heading">
          Current password
          <input
            className={inputClass}
            type={type}
            autoComplete="current-password"
            required
            maxLength={128}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-heading">
          New password
          <input
            className={inputClass}
            type={type}
            autoComplete="new-password"
            required
            maxLength={128}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <span className="mt-1 block text-xs font-normal text-text-muted">{PASSWORD_HINT}</span>
        </label>
        <label className="block text-sm font-medium text-heading">
          Confirm new password
          <input
            className={inputClass}
            type={type}
            autoComplete="new-password"
            required
            maxLength={128}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={change.isPending}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {change.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </button>
      </form>
    </section>
  )
}

export function AdvertiserSettingsPage() {
  const { advertiser, updateAccount } = useAdvertiserAuth()
  if (!advertiser) return null

  return (
    <div className="mx-auto w-full max-w-3xl">
      <AdvertiserPageHeader title="Settings" description="Notifications and sign-in security for your advertiser account." />
      <div className="space-y-6">
        <NotificationsCard account={advertiser} onChange={updateAccount} />
        <PasswordCard />
        <section className="rounded-2xl border border-border bg-card p-4 text-sm shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-heading">Account</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-text-muted">Sign-in email</dt>
              <dd className="mt-0.5 break-all font-medium text-heading">{advertiser.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Account status</dt>
              <dd className="mt-0.5 font-medium capitalize text-heading">{advertiser.status}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Member since</dt>
              <dd className="mt-0.5 font-medium text-heading">{formatDate(advertiser.createdAt)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
