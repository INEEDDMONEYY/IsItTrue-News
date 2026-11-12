import { API_BASE_URL } from '@/config/env'

// Images stored on the API's local backup storage come back as "/api/uploads/...", which must be loaded from the
// API's host rather than the site's. Cloudinary URLs are already absolute.
export function resolveAssetUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  return url.startsWith('/') ? `${API_BASE_URL}${url}` : url
}
