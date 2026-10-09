import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/app/providers/AuthProvider'
import { authService } from '@/features/auth/services/auth.service'
import { onboardingService } from '../services/onboarding.service'
import type { BecomeEditorPayload } from '../types/onboarding.types'

/**
 * Drives the "Become an Editor" onboarding form. Mirrors useAuthorOnboarding
 * exactly — resending the email verification link, sending/verifying a
 * phone code, and the final reader -> editor role-upgrade submission.
 */
export function useEditorOnboarding() {
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

  const becomeEditorMutation = useMutation({
    mutationFn: (payload: BecomeEditorPayload) => onboardingService.becomeEditor(payload),
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

    becomeEditor: becomeEditorMutation.mutateAsync,
    isBecomingEditor: becomeEditorMutation.isPending,
    becomeEditorError: becomeEditorMutation.error,
  }
}
