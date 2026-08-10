
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import logo from '@/assets/icons/question-icon-removebg.png'
import heroImage from '@/assets/images/lost.png'

export function NotFoundPage() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <section className="relative z-10 flex w-full max-w-lg flex-col items-center px-6 text-center">
        <img
          src={logo}
          alt="IsItTrue News"
          className="mb-8 h-14 w-auto object-contain rounded-3xl"
        />

        <p className="mb-3 text-sm font-semibold uppercase text-accent text-white">
          404
        </p>

        <h1 className="mb-4 text-3xl font-semibold text-white sm:text-4xl">
          Page not found
        </h1>

        <p className="mb-8 max-w-md leading-relaxed text-white">
          The page you are looking for may have moved, been removed, or never
          existed.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </section>
    </main>
  )
}

