export type UserRole = 'reader' | 'author' | 'editor' | 'admin'

export const USER_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'reader', label: 'Reader' },
  { value: 'author', label: 'Author' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  isEmailVerified: boolean
  createdAt: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
}
