import { Spinner } from '@/components/ui/Spinner'

interface PageLoaderProps {
  label?: string
  className?: string
}

export function PageLoader({ label = 'Loading...', className = '' }: PageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-center text-sm text-text-muted ${className}`}
    >
      <Spinner size="lg" />
      {label}
    </div>
  )
}
