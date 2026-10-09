import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

interface SignUpPromptModalProps {
  title: string
  description: string
  onClose: () => void
}

// Lightweight sign-up nudge shown when an anonymous visitor tries to use a
// feature that requires an account (bookmarking, following, commenting).
export function SignUpPromptModal({ title, description, onClose }: SignUpPromptModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl border border-card-border bg-card p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-card-text-dim hover:text-card-text"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold text-card-heading">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-card-text-muted">{description}</p>

        <div className="mt-5 flex items-center gap-3">
          <Link
            to="/register"
            className="flex-1 rounded-lg bg-brand-gradient px-4 py-2.5 text-center text-sm font-semibold text-on-brand transition"
          >
            Sign up
          </Link>
          <Link
            to="/login"
            className="flex-1 rounded-lg border border-card-border px-4 py-2.5 text-center text-sm font-semibold text-card-text transition hover:border-accent-border"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
