import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { corsOptions } from './config/cors.js'
import { isProduction } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import { authRoutes } from './modules/auth/routes/auth.routes.js'
import { userRoutes } from './modules/users/routes/user.routes.js'
import { categoryRoutes } from './modules/categories/routes/category.routes.js'
import { tagRoutes } from './modules/tags/routes/tag.routes.js'
import { articleRoutes } from './modules/articles/routes/article.routes.js'
import { bannerRoutes } from './modules/banners/routes/banner.routes.js'
import { ticketRoutes } from './modules/tickets/routes/ticket.routes.js'
import { factCheckRoutes } from './modules/factChecks/routes/factCheck.routes.js'
import { mediaRoutes } from './modules/media/routes/media.routes.js'

export function createApp(): Express {
  const app = express()

  app.use(
    helmet({
      // HSTS pins the *entire host* (all ports) to HTTPS in the browser for the
      // max-age duration. On localhost that breaks the plain-http Vite dev server,
      // so only send it in production where a real TLS-terminated domain is used.
      hsts: isProduction ? undefined : false,
    }),
  )
  app.use(cors(corsOptions))
  app.use(express.json({ limit: '10kb' }))
  app.use(cookieParser())
  app.use(morgan(isProduction ? 'combined' : 'dev'))

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/tags', tagRoutes)
  app.use('/api/articles', articleRoutes)
  app.use('/api/banners', bannerRoutes)
  app.use('/api/tickets', ticketRoutes)
  app.use('/api/fact-checks', factCheckRoutes)
  app.use('/api/media', mediaRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
