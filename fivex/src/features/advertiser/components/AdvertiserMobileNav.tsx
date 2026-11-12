
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { AdvertiserSidebar } from './AdvertiserSidebar'

interface AdvertiserMobileNavProps {
  open: boolean
  onClose: () => void
}

export function AdvertiserMobileNav({
  open,
  onClose,
}: AdvertiserMobileNavProps) {
  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="absolute inset-y-0 left-0 flex w-[min(290px,85vw)] flex-col bg-card shadow-2xl">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="text-sm font-semibold text-foreground">
            Advertiser Navigation
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1">
          <AdvertiserSidebar onNavigate={onClose} />
        </div>
      </div>
    </div>
  )
}
