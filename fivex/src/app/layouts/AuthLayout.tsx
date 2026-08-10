import { Outlet } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react'
import authImage from '@/assets/images/speak-up.jpg'
import { BannerBar } from '@/components/banners/BannerBar'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <BannerBar />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-12">
          <Outlet />
        </div>

      <div className="hidden lg:block relative m-3 rounded-3xl overflow-hidden">
        <img
          src={authImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <div className="absolute top-6 left-6">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>

        <div className="absolute bottom-8 left-8 right-8 text-white">
          <p className="text-lg leading-relaxed mb-4 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
            "IsItTrue changed how our newsroom verifies claims before
            publishing — faster fact-checks, fewer retractions."
          </p>
          <p className="font-semibold [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
            Amélie Laurent
          </p>
          <p className="text-sm text-white/70">Managing Editor, Sisyphus Times</p>

          <div className="flex items-center gap-2 mt-6">
            <button className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}