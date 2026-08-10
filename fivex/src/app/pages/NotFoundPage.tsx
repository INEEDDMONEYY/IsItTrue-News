import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '@/assets/logos/no-background.png'

export function NotFoundPage() {
	return (
		<section className="min-h-[65vh] flex flex-col items-center justify-center py-16 text-center">
			<Link to="/" className="flex flex-col items-center gap-4 mb-10">
				<img
					src={logo}
					alt="IsItTrue News"
					className="h-28 sm:h-32 w-auto rounded-md bg-white/95 px-3 py-2"
				/>
				<span className="text-xl font-semibold text-heading">IsItTrue News</span>
			</Link>

			<p className="text-sm font-semibold uppercase text-accent mb-3">404</p>
			<h1 className="text-3xl sm:text-4xl font-semibold text-heading mb-4">
				Page not found
			</h1>
			<p className="max-w-md text-text-muted leading-relaxed mb-8">
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
	)
}
