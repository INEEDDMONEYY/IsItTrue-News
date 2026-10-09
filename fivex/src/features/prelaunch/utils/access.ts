import { PRELAUNCH_ENABLED } from '@/config/prelaunch'

const STORAGE_KEY = 'itt-prelaunch-access'

export function hasPreLaunchAccess(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'granted'
  } catch {
    return false
  }
}

// Returns false when the browser blocks storage, so the caller can say so instead of looping.
export function grantPreLaunchAccess(): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'granted')
    return hasPreLaunchAccess()
  } catch {
    return false
  }
}

export function revokePreLaunchAccess(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

// This is a UI gate, not an authorization layer: it decides what the browser renders.
export function isSiteLocked(): boolean {
  return PRELAUNCH_ENABLED && !hasPreLaunchAccess()
}
