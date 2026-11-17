import type { Request, Response } from 'express'
import type { z } from 'zod'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { editorialAnalyticsService } from '../services/editorialAnalytics.service.js'
import { editorialReportsService } from '../services/editorialReports.service.js'
import { editorialAnalyticsQuerySchema, reportQuerySchema } from '../validations/editorialAnalytics.validation.js'

function parseWith<S extends z.ZodTypeAny>(schema: S, req: Request): z.output<S> {
  const result = schema.safeParse(req.query)
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join('.') || 'query'}: ${issue.message}`).join('; ')
    throw new AppError(message, 400)
  }
  return result.data
}

const parseQuery = (req: Request) => parseWith(editorialAnalyticsQuerySchema, req)

export const editorialAnalyticsController = {
  getWorkflow: asyncHandler(async (req: Request, res: Response) => {
    const workflow = await editorialAnalyticsService.getWorkflow(parseQuery(req))
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(workflow)
  }),

  getFactChecks: asyncHandler(async (req: Request, res: Response) => {
    const factChecks = await editorialAnalyticsService.getFactChecks(parseQuery(req))
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(factChecks)
  }),

  getInvestigations: asyncHandler(async (req: Request, res: Response) => {
    const investigations = await editorialAnalyticsService.getInvestigations(parseQuery(req))
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(investigations)
  }),

  getArticlePerformance: asyncHandler(async (req: Request, res: Response) => {
    const performance = await editorialAnalyticsService.getArticlePerformance(parseQuery(req))
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(performance)
  }),

  getReport: asyncHandler(async (req: Request, res: Response) => {
    const report = await editorialReportsService.getReport(parseWith(reportQuerySchema, req))
    res.setHeader('Cache-Control', 'no-store')
    if (report.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`)
      res.status(200).send(report.body)
      return
    }
    res.status(200).json(report.body)
  }),
  getOverview: asyncHandler(async (req: Request, res: Response) => {
    const overview = await editorialAnalyticsService.getOverview(parseQuery(req))
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(overview)
  }),

  getContentQuality: asyncHandler(async (req: Request, res: Response) => {
    const quality = await editorialAnalyticsService.getContentQuality(parseQuery(req))
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(quality)
  }),

  getAuthorPerformance: asyncHandler(async (req: Request, res: Response) => {
    const performance = await editorialAnalyticsService.getAuthorPerformance(parseQuery(req))
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(performance)
  }),
}
