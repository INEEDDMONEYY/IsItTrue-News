import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/config/env'

export const SESSION_EXPIRED_EVENT = 'auth:session-expired'

const AUTH_PATH_PREFIX = '/api/auth/'
const SESSION_CHECK_PATH = '/api/auth/me'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let renewal: Promise<void> | null = null

/**
 * Exchanges the refresh cookie for a new access token. Concurrent callers share one request.
 * When the refresh token is gone or expired, the session-expired event tells the app to sign out.
 */
export function renewSession(): Promise<void> {
  if (!renewal) {
    renewal = axiosInstance
      .post('/api/auth/refresh')
      .then(() => undefined)
      .catch((error) => {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
        throw error
      })
      .finally(() => {
        renewal = null
      })
  }
  return renewal
}

function canRenewSessionFor(url: string | undefined): boolean {
  if (!url) return false
  const path = url.split('?')[0]
  return path === SESSION_CHECK_PATH || !path.startsWith(AUTH_PATH_PREFIX)
}

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableConfig | undefined

    if (error.response?.status !== 401 || !config || config._retried || !canRenewSessionFor(config.url)) {
      return Promise.reject(error)
    }

    config._retried = true
    await renewSession()
    return axiosInstance(config)
  },
)
