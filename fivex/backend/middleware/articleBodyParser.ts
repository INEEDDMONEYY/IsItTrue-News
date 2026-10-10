import express, { type NextFunction, type Request, type Response } from 'express'

// Roughly 40,000 words of HTML. Large enough for any real article, small enough that one request can't tie up
// the server. (Images must be uploaded and referenced by URL, never embedded in the text.)
export const ARTICLE_WRITE_LIMIT = '256kb'

const parseLargeJson = express.json({ limit: ARTICLE_WRITE_LIMIT })

// Mounted at /api/articles, so req.path is relative: "/" creates an article, "/:id" updates one. Every other
// route under /api/articles (like, share, bookmark, status...) takes only tiny bodies and is left alone.
export function articleWriteJsonParser(req: Request, res: Response, next: NextFunction): void {
  const isCreate = req.method === 'POST' && req.path === '/'
  const isUpdate = req.method === 'PATCH' && /^\/[^/]+\/?$/.test(req.path)

  if (isCreate || isUpdate) {
    parseLargeJson(req, res, next)
    return
  }

  next()
}
