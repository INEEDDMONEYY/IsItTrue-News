import type { AuthUser } from './auth.types'

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface RegisterResponse {
  message: string
  user: AuthUser
}
