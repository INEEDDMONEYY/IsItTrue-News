
import { useCallback, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/features/admin/components/AdminSidebar'
import { AdminHeader } from '@/features/admin/components/AdminHeader'
import { BannerBar } from '@/components/banners/BannerBar'
import { PageTransition } from '@/components/animate-ui/components/page-transition'
import { PageScrollEffects } from '@/components/navigation/PageScrollEffects'

export function AdminLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true)
  }, [])

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return

    const endX = event.changedTouches[0]?.clientX
    if (endX === undefined) return

    const difference = endX - touchStartX.current

    if (isDrawerOpen && difference < -70) {
      closeDrawer()
    } else if (!isDrawerOpen && touchStartX.current <= 24 && difference > 70) {
      openDrawer()
    }

    touchStartX.current = null
  }

  return (
    <div
      className="min-h-screen flex bg-bg"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <PageScrollEffects />

      <AdminSidebar
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={openDrawer} />

        <BannerBar />

        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8 overflow-x-auto [&_h1]:text-brand-gradient">
          <PageTransition effect="bands">
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
