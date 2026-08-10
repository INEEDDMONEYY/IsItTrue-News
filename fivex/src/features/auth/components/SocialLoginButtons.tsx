import { Globe, X } from 'lucide-react'

export function SocialLoginButtons() {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-medium text-heading hover:bg-surface transition-colors"
      >
        <Globe className="w-4 h-4" />
        Sign in with Google
      </button>
      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-medium text-heading hover:bg-surface transition-colors"
      >
        <X className="w-4 h-4" />
        Sign in with X
      </button>
    </div>
  )
}