import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/auth.service'

// The server answers identically for every address, so success never means "an account exists".
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  })
}
