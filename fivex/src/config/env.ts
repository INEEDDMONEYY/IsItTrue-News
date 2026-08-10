// Empty string keeps requests relative so they go through the Vite dev proxy
// (same-origin, no CORS). Set VITE_API_URL in production to the deployed API URL.
export const API_BASE_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? ''
