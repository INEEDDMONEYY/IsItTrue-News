import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/app/providers/AuthProvider'
import { authService } from '@/features/auth/services/auth.service'
import { onboardingService } from '../services/onboarding.service'
import type { BecomeAuthorPayload } from '../types/onboarding.types'

/**
 * Drives the "Become an Author" onboarding form: resending the email
 * verification link, sending/verifying a phone code, and the final
 * reader -> author role-upgrade submission. Successful phone verification
 * and become-author calls patch the signed-in user in AuthProvider so the
 * dashboard sidebar/nav updates immediately.
 */
export function useAuthorOnboarding() {
  const { user, updateUser } = useAuth()

  const resendEmailMutation = useMutation({
    mutationFn: () => authService.resendVerification(user?.email ?? ''),
  })

  const sendPhoneCodeMutation = useMutation({
    mutationFn: (phone: string) => onboardingService.sendPhoneCode(phone),
  })

  const verifyPhoneCodeMutation = useMutation({
    mutationFn: (code: string) => onboardingService.verifyPhoneCode(code),
    onSuccess: (data) => updateUser(data.user),
  })

  const becomeAuthorMutation = useMutation({
    mutationFn: (payload: BecomeAuthorPayload) => onboardingService.becomeAuthor(payload),
    onSuccess: (data) => updateUser(data.user),
  })

  return {
    resendEmailVerification: resendEmailMutation.mutateAsync,
    isResendingEmail: resendEmailMutation.isPending,
    resendEmailError: resendEmailMutation.error,

    sendPhoneCode: sendPhoneCodeMutation.mutateAsync,
    isSendingPhoneCode: sendPhoneCodeMutation.isPending,
    sendPhoneCodeError: sendPhoneCodeMutation.error,

    verifyPhoneCode: verifyPhoneCodeMutation.mutateAsync,
    isVerifyingPhoneCode: verifyPhoneCodeMutation.isPending,
    verifyPhoneCodeError: verifyPhoneCodeMutation.error,

    becomeAuthor: becomeAuthorMutation.mutateAsync,
    isBecomingAuthor: becomeAuthorMutation.isPending,
    becomeAuthorError: becomeAuthorMutation.error,
  }
}
