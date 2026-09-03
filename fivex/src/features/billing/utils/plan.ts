import type { AuthUser } from '@/features/auth/types/auth.types'

export function isPremiumUser(user: AuthUser | null | undefined): boolean {
  return user?.plan === 'premium'
}
