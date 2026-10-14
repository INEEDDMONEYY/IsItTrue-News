import type { ReactNode } from 'react'
import loaderImage from '@/assets/isittrue-loader.svg'

interface LoaderStateProps {
  // A heading for the screen (e.g. "Article not found"). Left out for a section that simply failed to load.
  title?: string
  message?: ReactNode
  // Links or buttons shown under the message.
  children?: ReactNode
  // A smaller version for one section of a page that couldn't load, rather than the whole page.
  compact?: boolean
  // Announces the message to screen readers straight away; for load failures rather than a plain "not found".
  alert?: boolean
  className?: string
}

/**
 * The animated IsItTrue loader with a message, shown when something can't be found or can't be loaded.
 * The animation is decorative, so the message carries the meaning.
 */
export function LoaderState({ title, message, children, compact = false, alert = false, className = '' }: LoaderStateProps) {
  return (
    <div
      role={alert ? 'alert' : undefined}
      className={`flex flex-col items-center text-center ${compact ? 'gap-2 py-8' : 'gap-3 py-16'} ${className}`}
    >
      <img
        src={loaderImage}
        alt=""
        width={280}
        height={144}
        draggable={false}
        className={`h-auto max-w-full select-none ${compact ? 'w-32' : 'w-56'}`}
      />
      {title && <h1 className="text-2xl font-semibold text-heading">{title}</h1>}
      {message && <p className="max-w-md text-sm text-text-muted">{message}</p>}
      {children}
    </div>
  )
}
