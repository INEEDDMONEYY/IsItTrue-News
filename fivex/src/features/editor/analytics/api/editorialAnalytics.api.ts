import { apiClient } from '@/api/client'
import type {
  ArticlePerformanceResponse,
  AuthorPerformanceResponse,
  ContentQualityResponse,
  EditorialAnalyticsQuery,
  EditorialOverviewResponse,
  FactCheckResponse,
  InvestigationResponse,
  ReportDataset,
  WorkflowResponse,
} from '../types/editorialAnalytics.types'

export const editorialAnalyticsApi = {
  getOverview: async (query: EditorialAnalyticsQuery): Promise<EditorialOverviewResponse> => {
    const { data } = await apiClient.get<EditorialOverviewResponse>('/api/editorial-analytics/overview', {
      params: query,
    })
    return data
  },

  getAuthorPerformance: async (query: EditorialAnalyticsQuery): Promise<AuthorPerformanceResponse> => {
    const { data } = await apiClient.get<AuthorPerformanceResponse>('/api/editorial-analytics/authors', {
      params: query,
    })
    return data
  },

  getContentQuality: async (query: EditorialAnalyticsQuery): Promise<ContentQualityResponse> => {
    const { data } = await apiClient.get<ContentQualityResponse>('/api/editorial-analytics/content-quality', {
      params: query,
    })
    return data
  },

  getWorkflow: async (query: EditorialAnalyticsQuery): Promise<WorkflowResponse> => {
    const { data } = await apiClient.get<WorkflowResponse>('/api/editorial-analytics/workflow', { params: query })
    return data
  },

  getFactChecks: async (query: EditorialAnalyticsQuery): Promise<FactCheckResponse> => {
    const { data } = await apiClient.get<FactCheckResponse>('/api/editorial-analytics/fact-checks', { params: query })
    return data
  },

  getInvestigations: async (query: EditorialAnalyticsQuery): Promise<InvestigationResponse> => {
    const { data } = await apiClient.get<InvestigationResponse>('/api/editorial-analytics/investigations', {
      params: query,
    })
    return data
  },

  getArticlePerformance: async (query: EditorialAnalyticsQuery): Promise<ArticlePerformanceResponse> => {
    const { data } = await apiClient.get<ArticlePerformanceResponse>('/api/editorial-analytics/article-performance', {
      params: query,
    })
    return data
  },

  // Uses the same authorization as the dashboard, so the file contains only data the user may view.
  downloadReportCsv: async (dataset: ReportDataset, query: EditorialAnalyticsQuery): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>('/api/editorial-analytics/reports', {
      params: { ...query, dataset, format: 'csv' },
      responseType: 'blob',
    })
    return data
  },
}
