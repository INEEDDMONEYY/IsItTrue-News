import { Link } from 'react-router-dom'
import logo from '@/assets/icons/question-icon-removebg.png'

interface AuthHeaderProps {
  title: string
  subtitle?: string
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8">
      <Link to="/" className="inline-flex items-center gap-2 mb-8">
        <img src={logo} alt="IsItTrue" className="h-7 w-auto" />
      </Link>
      <h1 className="text-2xl font-semibold text-heading mb-1">{title}</h1>
      {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
    </div>
  )
}