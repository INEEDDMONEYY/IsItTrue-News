import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ScrollProgress,
  ScrollProgressProvider,
} from '@animate-ui/react/primitives/scroll-progress'

export function PageScrollEffects() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <ScrollProgressProvider global>
      <ScrollProgress className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-brand-gradient" />
    </ScrollProgressProvider>
  )
}
