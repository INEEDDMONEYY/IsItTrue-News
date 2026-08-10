import { createApp } from './app.js'
import { env } from './config/env.js'
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
    logger.info(`API server listening on port ${env.PORT} (${env.NODE_ENV})`)
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
