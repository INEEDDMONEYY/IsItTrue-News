import { Outlet, useLocation } from 'react-router-dom'
import { PageTransition } from '@/components/animate-ui/components/page-transition'
import { PageScrollEffects } from '@/components/navigation/PageScrollEffects'
import { Header } from '@/components/navigation/Header'
import { Footer } from '@/components/navigation/Footer'
import { BannerBar } from '@/components/banners/BannerBar'
import { AdSlot } from '@/features/ads/components/AdSlot'

export function MainLayout() {
  // The homepage spans the full viewport width; other pages keep the 1400px container.
  const isHome = useLocation().pathname === '/'
  const containerClass = isHome ? 'w-full px-4 md:px-8' : 'w-full max-w-[1400px] mx-auto px-4 md:px-8'

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <PageScrollEffects />
      <BannerBar />
      <Header />
      <main className={`flex-1 ${containerClass} [&_h1]:text-brand-gradient`}>
        <PageTransition effect="bands">
          <Outlet />
        </PageTransition>
      </main>
      <div className={containerClass}>
        <AdSlot placement="footer" className="mt-10" />
      </div>
      <Footer />
    </div>
  )
}
