import { Link } from 'react-router-dom'

export function AuthFooter() {
  return (
    <p className="text-center text-sm text-text-muted mt-6">
      Don't have an account?{' '}
      <Link to="/register" className="text-accent font-medium hover:text-accent-hover">
        Sign up
      </Link>
    </p>
  )
}