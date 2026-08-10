import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { BannerBar } from '@/components/banners/BannerBar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-bg">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <BannerBar />
        <main className="flex-1 px-6 md:px-8 py-6 md:py-8 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}