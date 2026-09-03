import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { searchService, type SearchType } from '../services/search.service.js'

const SEARCH_TYPES: SearchType[] = ['all', 'articles', 'videos', 'authors', 'topics']

export const searchController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    if (!q) {
      throw new AppError('A search query is required.', 400)
    }

    const rawType = typeof req.query.type === 'string' ? req.query.type : 'all'
    const type = SEARCH_TYPES.includes(rawType as SearchType) ? (rawType as SearchType) : 'all'

    const results = await searchService.search(q, type, req.user?.id)
    res.status(200).json(results)
  }),
}
