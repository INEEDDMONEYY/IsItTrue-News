import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/features/admin/components/AdminSidebar'
import { AdminHeader } from '@/features/admin/components/AdminHeader'
import { BannerBar } from '@/components/banners/BannerBar'

export function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-bg">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <BannerBar />
        <main className="flex-1 px-6 md:px-8 py-6 md:py-8 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}