import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useMediaUpload } from '@/features/authors/hooks/useMediaUpload'
import { authorSettingsApi } from '@/features/authors/api/authorSettings.api'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { useAuthorOnboarding } from '../hooks/useAuthorOnboarding'

const TRUTH_PROTOCOL_ITEMS = [
  'Editorial Standards',
  'Transparency Requirements',
  'Correction Policy',
  'Source Verification Rules',
  'No plagiarism',
  'No fabricated evidence',
  'No AI-generated news without disclosure',
]

export function AuthorOnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { upload, isUploading } = useMediaUpload({ profilePhoto: true })
  const {
    resendEmailVerification,
    isResendingEmail,
    sendPhoneCode,
    isSendingPhoneCode,
    verifyPhoneCode,
    isVerifyingPhoneCode,
    becomeAuthor,
    isBecomingAuthor,
  } = useAuthorOnboarding()

  const [phone, setPhone] = useState(user?.phone ?? '')
  const [phoneCode, setPhoneCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('')
  const [shortBio, setShortBio] = useState('')
  const [socialLinks, setSocialLinks] = useState({ twitter: '', linkedin: '', instagram: '' })
  const [acceptTruthProtocol, setAcceptTruthProtocol] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.role !== 'reader') {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  // Photo, bio and social links the user already saved in settings are reused as-is.
  const { data: savedProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['onboarding', 'existing-profile'],
    queryFn: authorSettingsApi.getMine,
    gcTime: 0,
  })
  const savedPhoto = savedProfile?.authorProfile.profileImage ?? ''
  const savedBio = savedProfile?.authorProfile.bio ?? ''
  const fullName = savedProfile?.name ?? user?.name ?? ''

  useEffect(() => {
    const links = savedProfile?.authorProfile.socialLinks
    if (links) {
      setSocialLinks({ twitter: links.twitter ?? '', linkedin: links.linkedin ?? '', instagram: links.instagram ?? '' })
    }
  }, [savedProfile])

  const isEmailVerified = Boolean(user?.isEmailVerified)
  const isPhoneVerified = Boolean(user?.isPhoneVerified)

  const canSubmit =
    !isProfileLoading &&
    fullName.trim().length >= 2 &&
    isEmailVerified &&
    isPhoneVerified &&
    Boolean(savedPhoto || profilePhotoUrl) &&
    Boolean(savedBio || shortBio.trim()) &&
    acceptTruthProtocol

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(null)
    try {
      const media = await upload(file)
      setProfilePhotoUrl(media.url)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to upload profile photo.'))
    }
  }

  const handleResendEmail = async () => {
    setError(null)
    setNotice(null)
    try {
      await resendEmailVerification()
      setNotice('Verification email sent — please check your inbox.')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to resend verification email.'))
    }
  }

  const handleSendCode = async () => {
    setError(null)
    setNotice(null)
    try {
      await sendPhoneCode(phone.trim())
      setCodeSent(true)
      setNotice('A verification code has been sent to your phone.')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send verification code.'))
    }
  }

  const handleVerifyCode = async () => {
    setError(null)
    setNotice(null)
    try {
      await verifyPhoneCode(phoneCode.trim())
      setNotice('Phone number verified.')
    } catch (err) {
      setError(getErrorMessage(err, 'That verification code is incorrect.'))
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setError(null)
    try {
      await becomeAuthor({
        fullName: fullName.trim(),
        profilePhotoUrl: savedPhoto ? undefined : profilePhotoUrl,
        shortBio: savedBio ? undefined : shortBio.trim(),
        socialLinks: {
          twitter: socialLinks.twitter.trim() || undefined,
          linkedin: socialLinks.linkedin.trim() || undefined,
          instagram: socialLinks.instagram.trim() || undefined,
        },
        acceptTruthProtocol,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to complete author onboarding.'))
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-[var(--color-card-border)] pb-8">
        <div className="mb-3 flex items-center gap-2 text-[var(--color-accent)]">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-semibold">Author Onboarding</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-heading)]">
          Complete your author application
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
          Once you finish these steps and accept the Truth Protocol, your dashboard switches from
          Reader to Author immediately.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {(error || notice) && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              error
                ? 'border-[var(--color-disputed)] bg-[rgba(220,38,38,0.06)] text-[var(--color-disputed)]'
                : 'border-[var(--color-verified)] bg-[rgba(22,163,74,0.06)] text-[var(--color-verified)]'
            }`}
          >
            {error || notice}
          </div>
        )}

        {/* Required info */}
        <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-[var(--color-card-heading)]">Required information</h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">Full name</label>
              <div className="rounded-xl border border-[var(--color-card-border)] p-4">
                <p className="text-sm text-[var(--color-card-text)]">{fullName}</p>
                <p className="mt-2 text-xs text-[var(--color-card-text-muted)]">
                  Using the name from your profile.{' '}
                  <Link to="/dashboard/reader-settings" className="font-medium text-[var(--color-accent)]">
                    Change in settings
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-card-border)] p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[var(--color-card-text-dim)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-card-heading)]">Email verification</p>
                  <p className="text-xs text-[var(--color-card-text-muted)]">{user?.email}</p>
                </div>
              </div>
              {isEmailVerified ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-verified)]">
                  <BadgeCheck className="h-4 w-4" /> Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResendingEmail}
                  className="rounded-lg border border-[var(--color-card-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-card-heading)] hover:border-[var(--color-accent)] disabled:opacity-60"
                >
                  {isResendingEmail ? 'Sending...' : 'Resend email'}
                </button>
              )}
            </div>

            <div className="rounded-xl border border-[var(--color-card-border)] p-4">
              <div className="mb-3 flex items-center gap-3">
                <Phone className="h-4 w-4 text-[var(--color-card-text-dim)]" />
                <p className="text-sm font-semibold text-[var(--color-card-heading)]">Phone verification</p>
                {isPhoneVerified && (
                  <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-[var(--color-verified)]">
                    <BadgeCheck className="h-4 w-4" /> Verified
                  </span>
                )}
              </div>

              {!isPhoneVerified && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="tel"
                    placeholder="+1 555 555 5555"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="flex-1 rounded-xl border border-[var(--color-card-border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSendingPhoneCode || phone.trim().length < 7}
                    className="rounded-xl border border-[var(--color-card-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-card-heading)] hover:border-[var(--color-accent)] disabled:opacity-60"
                  >
                    {isSendingPhoneCode ? 'Sending...' : codeSent ? 'Resend code' : 'Send code'}
                  </button>
                </div>
              )}

              {!isPhoneVerified && codeSent && (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    placeholder="6-digit code"
                    value={phoneCode}
                    onChange={(event) => setPhoneCode(event.target.value)}
                    className="flex-1 rounded-xl border border-[var(--color-card-border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isVerifyingPhoneCode || phoneCode.trim().length !== 6}
                    className="rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-on-brand disabled:opacity-60"
                  >
                    {isVerifyingPhoneCode ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">Profile photo</label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-card-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
                  {savedPhoto || profilePhotoUrl ? (
                    <img src={savedPhoto || profilePhotoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-6 w-6" />
                  )}
                </div>
                {savedPhoto ? (
                  <p className="text-sm text-[var(--color-card-text-muted)]">
                    Using the photo from your profile.{' '}
                    <Link to="/dashboard/reader-settings" className="font-medium text-[var(--color-accent)]">
                      Change in settings
                    </Link>
                  </p>
                ) : (
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-card-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-card-heading)] hover:border-[var(--color-accent)]">
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    {isUploading ? 'Uploading...' : profilePhotoUrl ? 'Change photo' : 'Upload photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">Short bio</label>
              {savedBio ? (
                <div className="rounded-xl border border-[var(--color-card-border)] p-4">
                  <p className="whitespace-pre-line text-sm text-[var(--color-card-text)]">{savedBio}</p>
                  <p className="mt-2 text-xs text-[var(--color-card-text-muted)]">
                    Using the bio from your profile.{' '}
                    <Link to="/dashboard/reader-settings" className="font-medium text-[var(--color-accent)]">
                      Change in settings
                    </Link>
                  </p>
                </div>
              ) : (
                <textarea
                  value={shortBio}
                  onChange={(event) => setShortBio(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell readers about your beat and experience..."
                  className="w-full rounded-xl border border-[var(--color-card-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
                />
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-card-heading)]">
                Social links <span className="font-normal text-[var(--color-card-text-dim)]">(optional)</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="Twitter URL"
                  value={socialLinks.twitter}
                  onChange={(event) => setSocialLinks((current) => ({ ...current, twitter: event.target.value }))}
                  className="rounded-xl border border-[var(--color-card-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
                />
                <input
                  type="text"
                  placeholder="LinkedIn URL"
                  value={socialLinks.linkedin}
                  onChange={(event) => setSocialLinks((current) => ({ ...current, linkedin: event.target.value }))}
                  className="rounded-xl border border-[var(--color-card-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
                />
                <input
                  type="text"
                  placeholder="Instagram URL"
                  value={socialLinks.instagram}
                  onChange={(event) => setSocialLinks((current) => ({ ...current, instagram: event.target.value }))}
                  className="rounded-xl border border-[var(--color-card-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-bg)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Truth Protocol */}
        <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-card-heading)]">The Truth Protocol</h2>
          <p className="mb-4 text-sm text-[var(--color-card-text-muted)]">
            Every author on IsItTrue News must accept the following before publishing:
          </p>

          <ul className="mb-5 space-y-2">
            {TRUTH_PROTOCOL_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--color-card-text)]">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                {item}
              </li>
            ))}
          </ul>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-card-border)] p-4">
            <input
              type="checkbox"
              checked={acceptTruthProtocol}
              onChange={(event) => setAcceptTruthProtocol(event.target.checked)}
              className="mt-0.5 h-5 w-5 accent-[var(--color-accent)]"
            />
            <span className="text-sm text-[var(--color-card-text)]">
              I have read and agree to accept the IsItTrue News Truth Protocol, including its
              editorial standards, transparency requirements, correction policy, and source
              verification rules.
            </span>
          </label>
        </section>

        <button
          type="submit"
          disabled={!canSubmit || isBecomingAuthor}
          className="w-full rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-on-brand transition disabled:opacity-50"
        >
          {isBecomingAuthor ? 'Submitting...' : 'Become an Author'}
        </button>
      </form>
    </main>
  )
}
