import { useEffect, useRef, useState } from 'react'
import { Check, Link2, Mail, Share2, Smartphone } from 'lucide-react'
import { buildShareTargets } from '../utils/shareLinks'

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

interface ShareMenuProps {
  url: string
  title: string
  count: number
  /** This reader's share is already counted. */
  shared?: boolean
  /** Only signed-in readers' shares are counted; anyone else is told so. */
  countsShare: boolean
  /** Called after a real share action (not when the menu is merely opened). */
  onShared: () => void
}

const ITEM =
  'flex items-center gap-2 w-full px-3 py-2 text-sm text-heading rounded-lg hover:bg-card-2 transition-colors text-left'

// The share button on an article. It opens a small panel for sharing the link outside the platform; the share
// counter is told only once something was actually shared.
export function ShareMenu({ url, title, count, shared = false, countsShare, onShared }: ShareMenuProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const canUseDeviceShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const shareWithDevice = async () => {
    setError(null)
    try {
      await navigator.share({ title, url })
      onShared()
      setOpen(false)
    } catch (err) {
      // Closing the device's share sheet is not a share and not an error.
      if (!(err instanceof DOMException && err.name === 'AbortError')) setError('Could not open sharing on this device.')
    }
  }

  const copyLink = async () => {
    setError(null)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      onShared()
    } catch {
      setError('Could not copy the link. Copy it from the address bar instead.')
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Share this article. ${count} ${count === 1 ? 'share' : 'shares'}`}
        className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border transition-colors ${
          shared
            ? 'bg-verified/10 text-verified border-verified/30'
            : 'border-border text-heading hover:border-accent-border hover:text-accent'
        }`}
      >
        <Share2 className="w-4 h-4" />
        {formatCount(count)}
      </button>

      {open && (
        <div
          role="group"
          aria-label="Share this article"
          className="absolute left-0 top-full mt-2 z-20 w-60 rounded-xl border border-border bg-card p-1.5 shadow-lg flex flex-col"
        >
          {canUseDeviceShare && (
            <button type="button" onClick={shareWithDevice} className={ITEM}>
              <Smartphone className="w-4 h-4 text-text-muted" />
              Share via…
            </button>
          )}

          <button type="button" onClick={copyLink} className={ITEM}>
            {copied ? <Check className="w-4 h-4 text-verified" /> : <Link2 className="w-4 h-4 text-text-muted" />}
            {copied ? 'Link copied' : 'Copy link'}
          </button>

          {buildShareTargets(url, title).map((target) => (
            <a
              key={target.id}
              href={target.href}
              target={target.id === 'email' ? undefined : '_blank'}
              rel="noopener noreferrer"
              onClick={() => {
                onShared()
                setOpen(false)
              }}
              className={ITEM}
            >
              {target.id === 'email' ? (
                <Mail className="w-4 h-4 text-text-muted" />
              ) : (
                <span aria-hidden className="w-4 text-center text-xs font-semibold text-text-muted">
                  {target.label[0]}
                </span>
              )}
              {target.label}
            </a>
          ))}

          {error && (
            <p role="alert" className="px-3 py-2 text-xs text-disputed">
              {error}
            </p>
          )}
          <p className="px-3 pt-1.5 pb-1 text-xs text-text-muted border-t border-border mt-1">
            {!countsShare
              ? 'Sign in and your share will be counted.'
              : shared
                ? 'Your share is already counted — each person counts once.'
                : 'Each person counts once, however many times they share.'}
          </p>
        </div>
      )}
    </div>
  )
}
