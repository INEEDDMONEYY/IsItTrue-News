import { createApp } from './app.js'
import { env, isProduction, trustProxyHops } from './config/env.js'
import { logger } from './config/logger.js'
import { connectDatabase, disconnectDatabase } from './database/connection.js'
import { categoryService } from './modules/categories/services/category.service.js'
import { tagService } from './modules/tags/services/tag.service.js'

async function main() {
  await connectDatabase()
  await categoryService.ensureDefaultCategories()
  await tagService.ensureDefaultTags()

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    logger.info(`API server listening on port ${env.PORT} (${env.NODE_ENV}), trusting ${trustProxyHops} proxy hop(s)`)
    logger.info(`CORS allows: ${env.CLIENT_ORIGINS.join(', ')}`)
    logger.info(
      env.UNOSEND_API_KEY
        ? `Mail: sending as ${env.MAIL_FROM} (the domain must be verified in Unosend)`
        : 'Mail: UNOSEND_API_KEY not set, so emails are logged instead of sent',
    )

    // A bare hostname like "isittruenews.com" never matches a browser's Origin header, which always
    // carries the scheme — the request is blocked and the browser only says "No Access-Control-Allow-Origin".
    const malformedOrigins = env.CLIENT_ORIGINS.filter((origin) => !/^https?:\/\/[^/\s]+$/.test(origin))
    if (malformedOrigins.length > 0) {
      logger.warn(
        `CLIENT_ORIGINS has entries that can never match a browser origin: ${malformedOrigins.join(', ')}. ` +
          'Use the full origin, e.g. https://www.isittruenews.com',
      )
    }
    if (isProduction && env.CLIENT_ORIGINS.every((origin) => /localhost|127\.0\.0\.1/.test(origin))) {
      logger.warn('CLIENT_ORIGINS only lists localhost in production: the deployed frontend will be blocked by CORS.')
    }
    if (isProduction && trustProxyHops === 0) {
      logger.warn(
        'TRUST_PROXY_HOPS is 0 in production: behind a load balancer every visitor will share one rate-limit bucket.',
      )
    }
  })

  async function shutdown(signal: string) {
    logger.info(`Received ${signal}, shutting down gracefully...`)
    server.close(async () => {
      await disconnectDatabase()
      process.exit(0)
    })
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

main().catch((error) => {
  logger.error('Failed to start server', error)
  process.exit(1)
})
