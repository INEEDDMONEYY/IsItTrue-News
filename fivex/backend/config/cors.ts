import type { CorsOptions } from 'cors'
import { env } from './env.js'

/**
 * Only allow requests from explicitly configured frontend origins.
 * Requests with no Origin header (server-to-server, curl, health checks) are allowed
 * through so infra tooling keeps working; browser requests are always checked.
 */
export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || env.CLIENT_ORIGINS.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`Origin "${origin}" is not allowed by CORS policy`))
  },
  credentials: true,
}
