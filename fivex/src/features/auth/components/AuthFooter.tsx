import { Link } from 'react-router-dom'

interface AuthFooterProps {
  mode?: 'login' | 'register'
}

export function AuthFooter({ mode = 'login' }: AuthFooterProps) {
  if (mode === 'register') {
    return (
      <p className="text-center text-sm text-text-muted mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-accent font-medium hover:text-accent-hover">
          Sign in
        </Link>
      </p>
    )
  }

  return (
    <p className="text-center text-sm text-text-muted mt-6">
      Don't have an account?{' '}
      <Link to="/register" className="text-accent font-medium hover:text-accent-hover">
        Sign up
      </Link>
    </p>
  )
}