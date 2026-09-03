import { AuthCard } from '../components/AuthCard'
import { AuthHeader } from '../components/AuthHeader'
import { AuthDivider } from '../components/AuthDivider'
import { SocialLoginButtons } from '../components/SocialLoginButtons'
import { RegisterForm } from '../components/RegisterForm'
import { AuthFooter } from '../components/AuthFooter'

export function RegisterPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Create your account"
        subtitle="Join IsItTrue News to follow authors, bookmark stories, and verify claims."
      />
      <RegisterForm />
      <AuthDivider />
      <SocialLoginButtons />
      <AuthFooter mode="register" />
    </AuthCard>
  )
}
