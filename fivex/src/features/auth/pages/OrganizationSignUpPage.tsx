import { AuthCard } from '../components/AuthCard'
import { AuthHeader } from '../components/AuthHeader'
import { AuthDivider } from '../components/AuthDivider'
import { SocialLoginButtons } from '../components/SocialLoginButtons'
import { OrganizationSignUpForm } from '../components/OrganizationSignUpForm'
import { AuthFooter } from '../components/AuthFooter'

export function OrganizationSignUpPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Create your organization account"
        subtitle="Set up your organization on IsItTrue News to manage seats, billing, and your newsroom's presence."
      />
      <OrganizationSignUpForm />
      <AuthDivider />
      <SocialLoginButtons />
      <AuthFooter mode="register" />
    </AuthCard>
  )
}
