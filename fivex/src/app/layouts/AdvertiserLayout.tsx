
import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdvertiserSidebar } from '@/features/advertiser/components/AdvertiserSidebar'
import { AdvertiserHeader } from '@/features/advertiser/components/AdvertiserHeader'
import { AdvertiserMobileNav } from '@/features/advertiser/components/AdvertiserMobileNav'
import { BannerBar } from '@/components/banners/BannerBar'
import { PageTransition } from '@/components/animate-ui/components/page-transition'
import { PageScrollEffects } from '@/components/navigation/PageScrollEffects'

export function AdvertiserLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false)
  }, [])

  const openMobileNav = useCallback(() => {
    setMobileNavOpen(true)
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <PageScrollEffects />
      <div className="hidden lg:flex">
        <AdvertiserSidebar />
      </div>

      <AdvertiserMobileNav
        open={mobileNavOpen}
        onClose={closeMobileNav}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdvertiserHeader onOpenMenu={openMobileNav} />

        <BannerBar />

        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <PageTransition effect="bands">
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
