import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard } from '../components/AuthCard'
import { AuthHeader } from '../components/AuthHeader'
import { ResetPasswordForm } from '../components/ResetPasswordForm'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  // Read once from the emailed link; it is kept in memory only (see the effect below).
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token')?.trim() ?? '')

  useEffect(() => {
    // The token is a secret: take it out of the address bar so it doesn't stay in browser history or get
    // shared by copying the URL. (A reload therefore needs the emailed link again.)
    if (window.location.search) navigate('/reset-password', { replace: true })

    // Never send this page's address to other sites, and keep it out of search results.
    const tags = [
      { name: 'referrer', content: 'no-referrer' },
      { name: 'robots', content: 'noindex, nofollow' },
    ].map(({ name, content }) => {
      const tag = document.createElement('meta')
      tag.name = name
      tag.content = content
      document.head.appendChild(tag)
      return tag
    })

    return () => tags.forEach((tag) => tag.remove())
  }, [navigate])

  if (!token) {
    return (
      <AuthCard>
        <AuthHeader
          title="This reset link isn't complete"
          subtitle="Open the link from your password reset email again, or request a new one."
        />
        <Link
          to="/forgot-password"
          className="block w-full py-2.5 rounded-xl bg-heading text-bg text-sm font-medium text-center hover:opacity-90 transition-opacity"
        >
          Request a new link
        </Link>
        <p className="text-center text-sm text-text-muted mt-6">
          <Link to="/login" className="text-accent font-medium hover:text-accent-hover">
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthHeader title="Choose a new password" subtitle="Pick something you don't use anywhere else." />
      <ResetPasswordForm token={token} />
    </AuthCard>
  )
}
