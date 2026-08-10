import type { AuthUser } from './auth.types'

export interface LoginPayload {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  message: string
  user: AuthUser
}