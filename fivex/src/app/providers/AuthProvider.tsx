import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { renewSession, SESSION_EXPIRED_EVENT } from '@/api/axios'
import { authService } from '@/features/auth/services/auth.service'
import type { AuthUser } from '@/features/auth/types/auth.types'

const SESSION_IDLE_TIMEOUT_MS = 60 * 60 * 1000
const SESSION_RENEW_INTERVAL_MS = 5 * 60 * 1000
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: AuthUser) => void
  logout: () => Promise<void>
  updateUser: (partial: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On first load, ask the backend if the auth cookie is still valid and restore
  // the session — otherwise a page refresh would always look "logged out" even
  // though the httpOnly cookie is still present.
  useEffect(() => {
    let cancelled = false

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handleSessionExpired = () => setUser(null)
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [])

  // Signs the user out after an hour without interaction, and keeps the session
  // alive while they are active by renewing it (throttled).
  const isAuthenticated = user !== null
  useEffect(() => {
    if (!isAuthenticated) return

    let idleTimer: number | undefined
    let lastRenewedAt = 0

    const signOutForInactivity = () => {
      authService.logout().catch(() => undefined).finally(() => setUser(null))
    }

    const resetIdleTimer = () => {
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(signOutForInactivity, SESSION_IDLE_TIMEOUT_MS)
    }

    const handleActivity = () => {
      resetIdleTimer()
      const now = Date.now()
      if (now - lastRenewedAt >= SESSION_RENEW_INTERVAL_MS) {
        lastRenewedAt = now
        renewSession().catch(() => undefined)
      }
    }

    const listenerOptions = { capture: true, passive: true }
    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, handleActivity, listenerOptions))
    resetIdleTimer()

    return () => {
      window.clearTimeout(idleTimer)
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, handleActivity, listenerOptions))
    }
  }, [isAuthenticated])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login: (nextUser) => setUser(nextUser),
      logout: async () => {
        try {
          await authService.logout()
        } finally {
          setUser(null)
        }
      },
      updateUser: (partial) => setUser((current) => (current ? { ...current, ...partial } : current)),
    }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

