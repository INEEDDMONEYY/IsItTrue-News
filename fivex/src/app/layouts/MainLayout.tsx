import { Outlet } from 'react-router-dom'
import { Header } from '@/components/navigation/Header'
import { Footer } from '@/components/navigation/Footer'
import { BannerBar } from '@/components/banners/BannerBar'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <BannerBar />
      <Header />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}