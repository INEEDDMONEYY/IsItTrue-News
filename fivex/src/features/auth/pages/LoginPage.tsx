import { AuthCard } from '../components/AuthCard'
import { AuthHeader } from '../components/AuthHeader'
import { AuthDivider } from '../components/AuthDivider'
import { SocialLoginButtons } from '../components/SocialLoginButtons'
import { LoginForm } from '../components/LoginForm'
import { AuthFooter } from '../components/AuthFooter'

export function LoginPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Sign in to your account"
        subtitle="Welcome back. Verify claims, not rumors."
      />
      <LoginForm />
      <AuthDivider />
      <SocialLoginButtons />
      <AuthFooter />
    </AuthCard>
  )
}