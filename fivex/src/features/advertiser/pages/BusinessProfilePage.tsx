import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Building2, CheckCircle2, Loader2, Trash2, Upload } from 'lucide-react'
import { useAdvertiserAuth } from '@/app/providers/AdvertiserAuthProvider'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { advertiserApi } from '../api/advertiser.api'
import { AdvertiserPageHeader } from '../components/AdvertiserPageHeader'
import type { AdvertiserAccount, UpdateProfileInput } from '../types/advertiser.types'
import { resolveAssetUrl } from '../utils/assetUrl'

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-heading placeholder:text-text-dim focus:border-accent focus:outline-none'

function toForm(account: AdvertiserAccount): UpdateProfileInput {
  const profile = account.profile
  return {
    businessName: account.businessName,
    contactName: profile?.contactName ?? '',
    phone: profile?.phone ?? '',
    website: profile?.website ?? '',
    industry: profile?.industry ?? '',
    description: profile?.description ?? '',
    billingEmail: profile?.billingEmail ?? '',
    address: {
      line1: profile?.address?.line1 ?? '',
      line2: profile?.address?.line2 ?? '',
      city: profile?.address?.city ?? '',
      region: profile?.address?.region ?? '',
      postalCode: profile?.address?.postalCode ?? '',
      country: profile?.address?.country ?? '',
    },
  }
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block text-sm font-medium text-heading ${className}`}>
      {label}
      {children}
    </label>
  )
}

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold text-heading">{title}</h2>
      {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function LogoCard({ account, onChange }: { account: AdvertiserAccount; onChange: (account: AdvertiserAccount) => void }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const upload = useMutation({ mutationFn: advertiserApi.uploadLogo, onSuccess: onChange })
  const remove = useMutation({ mutationFn: advertiserApi.removeLogo, onSuccess: onChange })
  const logo = resolveAssetUrl(account.profile?.logoUrl)
  const busy = upload.isPending || remove.isPending

  return (
    <Card title="Logo" description="Shown next to your business name in your dashboard.">
      <div className="flex flex-wrap items-center gap-4">
        {logo ? (
          <img src={logo} alt={`${account.businessName} logo`} className="h-20 w-20 rounded-2xl border border-border bg-surface object-contain" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-border bg-surface text-text-dim">
            <Building2 className="h-7 w-7" aria-hidden="true" />
          </div>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            setError(null)
            upload.mutate(file, { onError: (err) => setError(getErrorMessage(err, 'Could not upload the logo.')) })
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-heading hover:bg-surface disabled:opacity-60"
          >
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {logo ? 'Replace logo' : 'Upload logo'}
          </button>
          {logo && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setError(null)
                remove.mutate(undefined, { onError: (err) => setError(getErrorMessage(err, 'Could not remove the logo.')) })
              }}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10 disabled:opacity-60"
            >
              {remove.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Remove
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-text-muted">Square JPG, PNG, WebP or GIF, up to 5 MB.</p>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </Card>
  )
}

function ProfileForm({ account, onChange }: { account: AdvertiserAccount; onChange: (account: AdvertiserAccount) => void }) {
  const [form, setForm] = useState<UpdateProfileInput>(() => toForm(account))
  const [saved, setSaved] = useState(false)
  const save = useMutation({ mutationFn: advertiserApi.updateProfile })

  const set = <K extends keyof UpdateProfileInput>(key: K, value: UpdateProfileInput[K]) => {
    setSaved(false)
    setForm((prev) => ({ ...prev, [key]: value }))
  }
  const setAddress = (key: keyof UpdateProfileInput['address'], value: string) => {
    setSaved(false)
    setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }))
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSaved(false)
    save.mutate(form, {
      onSuccess: (updated) => {
        onChange(updated)
        setForm(toForm(updated))
        setSaved(true)
      },
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card title="Business details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Business name">
            <input className={inputClass} required minLength={2} maxLength={120} value={form.businessName} onChange={(e) => set('businessName', e.target.value)} />
          </Field>
          <Field label="Industry">
            <input className={inputClass} maxLength={80} value={form.industry} onChange={(e) => set('industry', e.target.value)} placeholder="e.g. Retail" />
          </Field>
          <Field label="Website">
            <input className={inputClass} type="url" maxLength={2048} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://example.com" />
          </Field>
          <Field label="Account email">
            <input className={`${inputClass} cursor-not-allowed opacity-70`} value={account.email} readOnly aria-readonly="true" />
          </Field>
          <Field label="About your business" className="sm:col-span-2">
            <textarea
              className={`${inputClass} min-h-[96px] resize-y`}
              maxLength={1000}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
            <span className="mt-1 block text-right text-xs font-normal text-text-dim">{form.description.length}/1000</span>
          </Field>
        </div>
      </Card>

      <Card title="Contact & billing">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Contact name">
            <input className={inputClass} maxLength={120} value={form.contactName} onChange={(e) => set('contactName', e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className={inputClass} type="tel" maxLength={40} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="Billing email" className="sm:col-span-2">
            <input
              className={inputClass}
              type="email"
              maxLength={254}
              value={form.billingEmail}
              onChange={(e) => set('billingEmail', e.target.value)}
              placeholder={account.email}
            />
          </Field>
          <Field label="Address line 1">
            <input className={inputClass} maxLength={200} value={form.address.line1} onChange={(e) => setAddress('line1', e.target.value)} />
          </Field>
          <Field label="Address line 2">
            <input className={inputClass} maxLength={200} value={form.address.line2} onChange={(e) => setAddress('line2', e.target.value)} />
          </Field>
          <Field label="City">
            <input className={inputClass} maxLength={100} value={form.address.city} onChange={(e) => setAddress('city', e.target.value)} />
          </Field>
          <Field label="State / region">
            <input className={inputClass} maxLength={100} value={form.address.region} onChange={(e) => setAddress('region', e.target.value)} />
          </Field>
          <Field label="Postal code">
            <input className={inputClass} maxLength={20} value={form.address.postalCode} onChange={(e) => setAddress('postalCode', e.target.value)} />
          </Field>
          <Field label="Country">
            <input className={inputClass} maxLength={100} value={form.address.country} onChange={(e) => setAddress('country', e.target.value)} />
          </Field>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save profile
        </button>
        {saved && (
          <p role="status" className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Profile saved
          </p>
        )}
        {save.isError && (
          <p role="alert" className="text-sm text-red-600">
            {getErrorMessage(save.error, 'Could not save your profile.')}
          </p>
        )}
      </div>
    </form>
  )
}

export function BusinessProfilePage() {
  const { advertiser, updateAccount } = useAdvertiserAuth()
  if (!advertiser) return null

  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdvertiserPageHeader title="Business Profile" description="The business details we use for your campaigns and billing." />
      <div className="space-y-6">
        <LogoCard account={advertiser} onChange={updateAccount} />
        <ProfileForm key={advertiser.id} account={advertiser} onChange={updateAccount} />
      </div>
    </div>
  )
}
