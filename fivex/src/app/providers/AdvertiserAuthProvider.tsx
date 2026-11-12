import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { advertiserApi } from '@/features/advertiser/api/advertiser.api'
import { ADVERTISER_QUERY_KEY } from '@/features/advertiser/hooks/useAdvertiserOverview'
import type {
  AdvertiserAccount,
  AdvertiserCredentials,
  AdvertiserRegistration,
} from '@/features/advertiser/types/advertiser.types'

interface AdvertiserAuthContextType {
  advertiser: AdvertiserAccount | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: AdvertiserCredentials) => Promise<void>
  // Creating an account does not sign anyone in: the email has to be confirmed first. Resolves with the
  // server's message to show.
  register: (registration: AdvertiserRegistration) => Promise<string>
  logout: () => Promise<void>
}

const AdvertiserAuthContext = createContext<AdvertiserAuthContextType | undefined>(undefined)

/**
 * Advertiser sign-in, kept entirely apart from the reader/author/editor/admin AuthProvider: its own accounts,
 * its own API (/api/advertiser/auth) and its own session cookie. The session lives in an httpOnly cookie the
 * server sets, so nothing about it is stored in the browser where scripts could read it.
 */
export function AdvertiserAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [advertiser, setAdvertiser] = useState<AdvertiserAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Ask the server who the cookie belongs to. Any failure (no cookie, expired, suspended, offline) is simply
  // "not signed in".
  useEffect(() => {
    let active = true

    advertiserApi
      .me()
      .then((account) => {
        if (active) setAdvertiser(account)
      })
      .catch(() => {
        if (active) setAdvertiser(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(
    async (credentials: AdvertiserCredentials) => {
      const account = await advertiserApi.login(credentials)
      // Never show another account's cached numbers to whoever signs in next.
      queryClient.removeQueries({ queryKey: ADVERTISER_QUERY_KEY })
      setAdvertiser(account)
    },
    [queryClient],
  )

  const register = useCallback((registration: AdvertiserRegistration) => advertiserApi.register(registration), [])

  const logout = useCallback(async () => {
    try {
      await advertiserApi.logout()
    } finally {
      // Signed out here even if the request failed, so the person isn't left looking at a live-looking page.
      queryClient.removeQueries({ queryKey: ADVERTISER_QUERY_KEY })
      setAdvertiser(null)
    }
  }, [queryClient])

  const value = useMemo<AdvertiserAuthContextType>(
    () => ({ advertiser, isAuthenticated: Boolean(advertiser), isLoading, login, register, logout }),
    [advertiser, isLoading, login, register, logout],
  )

  return <AdvertiserAuthContext.Provider value={value}>{children}</AdvertiserAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdvertiserAuth() {
  const context = useContext(AdvertiserAuthContext)

  if (!context) {
    throw new Error('useAdvertiserAuth must be used within AdvertiserAuthProvider.')
  }

  return context
}
