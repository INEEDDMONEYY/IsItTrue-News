import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { MobileNavDrawer } from '@/features/dashboard/components/MobileNavDrawer'
import { BannerBar } from '@/components/banners/BannerBar'

export function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  return (
    <div className="min-h-screen flex bg-bg">
      <DashboardSidebar />
      <MobileNavDrawer open={mobileNavOpen} onClose={closeMobileNav} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onOpenMenu={() => setMobileNavOpen(true)} />
        <BannerBar />
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8 overflow-x-auto [&_h1]:text-brand-gradient">
          <Outlet />
        </main>
      </div>
    </div>
  )
}