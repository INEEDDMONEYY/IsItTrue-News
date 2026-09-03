import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/auth.service'
import type { RegisterPayload } from '../types/register.types'

// Registration doesn't sign the user in (email verification is required
// first), so there's no session side-effect here — just the mutation state.
export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  })
}
