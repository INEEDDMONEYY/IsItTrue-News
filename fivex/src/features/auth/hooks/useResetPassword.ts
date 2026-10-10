import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/auth.service'

// Resetting doesn't sign the user in; they sign in with the new password afterwards.
export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: { token: string; password: string }) => authService.resetPassword(payload),
  })
}
