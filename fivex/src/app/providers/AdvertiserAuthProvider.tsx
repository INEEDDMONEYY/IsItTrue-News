import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { advertiserApi } from '@/features/advertiser/api/advertiser.api'
import { ADVERTISER_QUERY_KEY } from '@/features/advertiser/hooks/useAdvertiserOverview'
import type {
  AdvertiserAccount,
  AdvertiserCredentials,
  AdvertiserRegistration,
} from '@/features/advertiser/types/advertiser.types'

type SessionStatus = 'idle' | 'checking' | 'ready' | 'error'

interface AdvertiserAuthContextType {
  advertiser: AdvertiserAccount | null
  isAuthenticated: boolean
  isLoading: boolean
  // The server couldn't be reached to confirm the session (offline, API waking up). The advertiser is NOT
  // treated as signed out in that case; `retrySession` checks again.
  hasSessionError: boolean
  retrySession: () => void
  login: (credentials: AdvertiserCredentials) => Promise<void>
  // Creating an account does not sign anyone in: the email has to be confirmed first. Resolves with the
  // server's message to show.
  register: (registration: AdvertiserRegistration) => Promise<string>
  logout: () => Promise<void>
  // Replaces the signed-in account after the advertiser edits it (e.g. a new business name or logo).
  updateAccount: (account: AdvertiserAccount) => void
}

interface InternalContext extends AdvertiserAuthContextType {
  ensureSession: () => void
}

const AdvertiserAuthContext = createContext<InternalContext | undefined>(undefined)

const RETRY_DELAYS_MS = [1000, 2500]
// While the app stays open, the session is re-confirmed in the background at most this often.
const REVALIDATE_AFTER_MS = 60 * 1000

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Only the server saying "no session" (401) or "this account can't sign in" (403) ends a session.
function isSignedOutError(error: unknown): boolean {
  const status = isAxiosError(error) ? error.response?.status : undefined
  return status === 401 || status === 403
}

/**
 * Advertiser sign-in, kept entirely apart from the reader/author/editor/admin AuthProvider: its own accounts,
 * its own API (/api/advertiser/auth) and its own session cookie. The session lives in an httpOnly cookie the
 * server sets, so nothing about it is stored in the browser where scripts could read it.
 *
 * Mounted once for the whole app so the session outlives a trip to the main site. The check against the API
 * is lazy: it only runs once advertiser UI asks for it, so ordinary readers never hit the advertiser API.
 */
export function AdvertiserAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [advertiser, setAdvertiser] = useState<AdvertiserAccount | null>(null)
  const [status, setStatus] = useState<SessionStatus>('idle')

  const statusRef = useRef<SessionStatus>('idle')
  const inFlightRef = useRef(false)
  const lastCheckedRef = useRef(0)
  // Bumped by sign-in/out so a check that started earlier can't overwrite what the advertiser just did.
  const generationRef = useRef(0)

  const updateStatus = useCallback((next: SessionStatus) => {
    statusRef.current = next
    setStatus(next)
  }, [])

  const checkSession = useCallback(
    async (background: boolean) => {
      if (inFlightRef.current) return
      inFlightRef.current = true
      const generation = generationRef.current
      if (!background) updateStatus('checking')

      try {
        for (let attempt = 0; ; attempt += 1) {
          try {
            const account = await advertiserApi.me()
            if (generation !== generationRef.current) return
            setAdvertiser(account)
            updateStatus('ready')
            return
          } catch (error) {
            if (generation !== generationRef.current) return
            if (isSignedOutError(error)) {
              setAdvertiser(null)
              updateStatus('ready')
              return
            }
            if (attempt >= RETRY_DELAYS_MS.length) {
              // A background re-check keeps the current session; a first check has nothing to show yet.
              if (!background) updateStatus('error')
              return
            }
            await wait(RETRY_DELAYS_MS[attempt])
          }
        }
      } finally {
        inFlightRef.current = false
        lastCheckedRef.current = Date.now()
      }
    },
    [updateStatus],
  )

  const ensureSession = useCallback(() => {
    if (statusRef.current === 'idle') {
      void checkSession(false)
    } else if (statusRef.current === 'ready' && Date.now() - lastCheckedRef.current > REVALIDATE_AFTER_MS) {
      void checkSession(true)
    }
  }, [checkSession])

  const retrySession = useCallback(() => {
    void checkSession(false)
  }, [checkSession])

  const login = useCallback(
    async (credentials: AdvertiserCredentials) => {
      const account = await advertiserApi.login(credentials)
      generationRef.current += 1
      lastCheckedRef.current = Date.now()
      // Never show another account's cached numbers to whoever signs in next.
      queryClient.removeQueries({ queryKey: ADVERTISER_QUERY_KEY })
      setAdvertiser(account)
      updateStatus('ready')
    },
    [queryClient, updateStatus],
  )

  const register = useCallback((registration: AdvertiserRegistration) => advertiserApi.register(registration), [])

  const logout = useCallback(async () => {
    generationRef.current += 1
    try {
      await advertiserApi.logout()
    } finally {
      // Signed out here even if the request failed, so the person isn't left looking at a live-looking page.
      queryClient.removeQueries({ queryKey: ADVERTISER_QUERY_KEY })
      setAdvertiser(null)
      lastCheckedRef.current = Date.now()
      updateStatus('ready')
    }
  }, [queryClient, updateStatus])

  const updateAccount = useCallback((account: AdvertiserAccount) => setAdvertiser(account), [])

  const value = useMemo<InternalContext>(
    () => ({
      advertiser,
      isAuthenticated: Boolean(advertiser),
      isLoading: status === 'idle' || status === 'checking',
      hasSessionError: status === 'error',
      retrySession,
      login,
      register,
      logout,
      updateAccount,
      ensureSession,
    }),
    [advertiser, status, retrySession, login, register, logout, updateAccount, ensureSession],
  )

  return <AdvertiserAuthContext.Provider value={value}>{children}</AdvertiserAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdvertiserAuth(): AdvertiserAuthContextType {
  const context = useContext(AdvertiserAuthContext)

  if (!context) {
    throw new Error('useAdvertiserAuth must be used within AdvertiserAuthProvider.')
  }

  const { ensureSession } = context
  useEffect(() => {
    ensureSession()
  }, [ensureSession])

  return context
}
