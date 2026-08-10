import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { settingsService } from '../services/settings.service'
import type { ChangeEmailPayload, ChangePasswordPayload, UpdateNamePayload } from '../api/settings.api'

export function useUpdateName() {
  const { updateUser } = useAuth()

  return useMutation({
    mutationFn: (payload: UpdateNamePayload) => settingsService.updateName(payload),
    onSuccess: (user) => {
      updateUser({ name: user.name })
    },
  })
}

export function useChangeEmail() {
  const { updateUser } = useAuth()

  return useMutation({
    mutationFn: (payload: ChangeEmailPayload) => settingsService.changeEmail(payload),
    onSuccess: (user) => {
      updateUser({ email: user.email })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => settingsService.changePassword(payload),
  })
}

export function useDeleteOwnAccount() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => settingsService.deleteOwnAccount(),
    onSuccess: async () => {
      await logout()
      navigate('/')
    },
  })
}
