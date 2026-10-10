import { Link } from 'react-router-dom'
import { AuthCard } from '../components/AuthCard'
import { AuthHeader } from '../components/AuthHeader'
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Forgot your password?"
        subtitle="Enter the email you signed up with and we'll send you a link to choose a new one."
      />
      <ForgotPasswordForm />
      <p className="text-center text-sm text-text-muted mt-6">
        Remembered it?{' '}
        <Link to="/login" className="text-accent font-medium hover:text-accent-hover">
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}
