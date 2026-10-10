import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { corsOptions } from './config/cors.js'
import { isProduction, trustProxyHops } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { articleWriteJsonParser } from './middleware/articleBodyParser.js'
import { notFound } from './middleware/notFound.js'
import { LOCAL_UPLOAD_ROOT, LOCAL_UPLOAD_URL_PREFIX } from './storage/local.js'
import { authRoutes } from './modules/auth/routes/auth.routes.js'
import { userRoutes } from './modules/users/routes/user.routes.js'
import { categoryRoutes } from './modules/categories/routes/category.routes.js'
import { tagRoutes } from './modules/tags/routes/tag.routes.js'
import { articleRoutes } from './modules/articles/routes/article.routes.js'
import { bannerRoutes } from './modules/banners/routes/banner.routes.js'
import { ticketRoutes } from './modules/tickets/routes/ticket.routes.js'
import { factCheckRoutes } from './modules/factChecks/routes/factCheck.routes.js'
import { claimRoutes } from './modules/claims/routes/claim.routes.js'
import { mediaRoutes } from './modules/media/routes/media.routes.js'
import { commentRoutes } from './modules/comments/routes/comment.routes.js'
import { bookmarkRoutes } from './modules/bookmarks/routes/bookmark.routes.js'
import { notificationRoutes } from './modules/notifications/routes/notification.routes.js'
import { videoRoutes } from './modules/videos/routes/video.routes.js'
import { topicSubmissionRoutes } from './modules/topicSubmissions/routes/topicSubmission.routes.js'
import { searchRoutes } from './modules/search/routes/search.routes.js'
import { investigationRoutes } from './modules/investigations/routes/investigation.routes.js'
import { correctionRoutes } from './modules/corrections/routes/correction.routes.js'
import { prelaunchRoutes } from './modules/prelaunch/routes/prelaunch.routes.js'
import { analyticsRoutes } from './modules/analytics/routes/analytics.routes.js'

export function createApp(): Express {
  const app = express()

  // Behind a proxy, req.ip is the proxy's address unless Express is told how many hops to trust.
  // A hop count (never `true`) means only the entries the trusted proxies appended are believed, so a
  // client can't pick its own IP by sending a forged X-Forwarded-For. See TRUST_PROXY_HOPS in env.ts.
  app.set('trust proxy', trustProxyHops)

  app.use(
    helmet({
      // HSTS pins the *entire host* (all ports) to HTTPS in the browser for the
      // max-age duration. On localhost that breaks the plain-http Vite dev server,
      // so only send it in production where a real TLS-terminated domain is used.
      hsts: isProduction ? undefined : false,
    }),
  )
  app.use(cors(corsOptions))
  // Article text is rich-text HTML and legitimately runs past 10 KB, so saving an article gets a larger limit.
  // This must come before the global parser below, which skips bodies that are already parsed. Every other
  // endpoint (including the rest of /api/articles) keeps the small default.
  app.use('/api/articles', articleWriteJsonParser)
  app.use(express.json({ limit: '10kb' }))
  app.use(cookieParser())
  app.use(morgan(isProduction ? 'combined' : 'dev'))

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
  })

  // Backup-stored uploads (used when Cloudinary is unavailable).
  app.use(
    LOCAL_UPLOAD_URL_PREFIX,
    (_req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      next()
    },
    express.static(LOCAL_UPLOAD_ROOT, { index: false, dotfiles: 'deny' }),
  )

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/tags', tagRoutes)
  app.use('/api/articles', articleRoutes)
  app.use('/api/banners', bannerRoutes)
  app.use('/api/tickets', ticketRoutes)
  app.use('/api/fact-checks', factCheckRoutes)
  app.use('/api/claims', claimRoutes)
  app.use('/api/comments', commentRoutes)
  app.use('/api/media', mediaRoutes)
  app.use('/api/bookmarks', bookmarkRoutes)
  app.use('/api/notifications', notificationRoutes)
  app.use('/api/videos', videoRoutes)
  app.use('/api/topic-submissions', topicSubmissionRoutes)
  app.use('/api/search', searchRoutes)
  app.use('/api/investigations', investigationRoutes)
  app.use('/api/corrections', correctionRoutes)
  app.use('/api/prelaunch', prelaunchRoutes)
  app.use('/api/analytics', analyticsRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
