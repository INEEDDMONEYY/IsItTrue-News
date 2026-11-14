
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  getAuditLogs,
  getAuditLogSummary,
  getAuditLogActors,
} from '../api/auditLogs.api'

import type {
  AuditLogActor,
  AuditLogFilters,
  AuditLogQueryParams,
  AuditLogSummary,
} from '../types/auditLog.types'

const DEFAULT_FILTERS: AuditLogFilters = {
  search: '',
  category: 'all',
  severity: 'all',
  outcome: 'all',
  actorId: '',
  startDate: '',
  endDate: '',
  sortOrder: 'newest',
}

const DEFAULT_SUMMARY: AuditLogSummary = {
  totalEvents: 0,
  eventsToday: 0,
  adminActions: 0,
  securityEvents: 0,
  failedActions: 0,
  changesSincePreviousPeriod: 0,
}

export function useAuditLogs() {
  const [filters, setFilters] =
    useState<AuditLogFilters>(DEFAULT_FILTERS)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [logs, setLogs] = useState<
    Awaited<ReturnType<typeof getAuditLogs>>['data']
  >([])

  const [actors, setActors] = useState<AuditLogActor[]>([])
  const [actorsLoading, setActorsLoading] = useState(true)

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })

  const [summary, setSummary] =
    useState<AuditLogSummary>(DEFAULT_SUMMARY)

  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const queryParams = useMemo<AuditLogQueryParams>(
    () => ({
      ...filters,
      page,
      pageSize,
    }),
    [filters, page, pageSize],
  )

  // Load audit log records
  useEffect(() => {
    let active = true

    const loadLogs = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getAuditLogs(queryParams)

        if (!active) return

        setLogs(response.data)
        setPagination(response.pagination)
      } catch (err) {
        if (!active) return

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load audit logs.',
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadLogs()

    return () => {
      active = false
    }
  }, [queryParams, refreshKey])

  // Load audit log summary
  useEffect(() => {
    let active = true

    const loadSummary = async () => {
      setSummaryLoading(true)

      try {
        const response = await getAuditLogSummary()

        if (active) {
          setSummary(response)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load audit log summary.',
          )
        }
      } finally {
        if (active) {
          setSummaryLoading(false)
        }
      }
    }

    loadSummary()

    return () => {
      active = false
    }
  }, [refreshKey])

  // Load unique actors for the filter dropdown
  useEffect(() => {
    let active = true

    const loadActors = async () => {
      setActorsLoading(true)

      try {
        const response = await getAuditLogActors()

        if (active) {
          setActors(response)
        }
      } catch (err) {
        if (active) {
          console.error(
            'Failed to load audit log actors:',
            err,
          )
        }
      } finally {
        if (active) {
          setActorsLoading(false)
        }
      }
    }

    loadActors()

    return () => {
      active = false
    }
  }, [refreshKey])

  // Update a single filter
  const updateFilter = useCallback(
    <K extends keyof AuditLogFilters>(
      key: K,
      value: AuditLogFilters[K],
    ) => {
      setFilters((current) => ({
        ...current,
        [key]: value,
      }))

      setPage(1)
    },
    [],
  )

  // Update multiple filters
  const updateFilters = useCallback(
    (updates: Partial<AuditLogFilters>) => {
      setFilters((current) => ({
        ...current,
        ...updates,
      }))

      setPage(1)
    },
    [],
  )

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [])

  // Pagination
  const changePage = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage))
  }, [])

  const changePageSize = useCallback((nextSize: number) => {
    setPageSize(nextSize)
    setPage(1)
  }, [])

  // Refresh all audit log data
  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1)
  }, [])

  // Check whether filters are active
  const hasActiveFilters = useMemo(
    () =>
      filters.search !== '' ||
      filters.category !== 'all' ||
      filters.severity !== 'all' ||
      filters.outcome !== 'all' ||
      filters.actorId !== '' ||
      filters.startDate !== '' ||
      filters.endDate !== '',
    [filters],
  )

  return {
    // Data
    logs,
    actors,
    summary,
    pagination,

    // Filters
    filters,
    queryParams,
    hasActiveFilters,

    // Loading states
    loading,
    actorsLoading,
    summaryLoading,

    // Errors
    error,

    // Pagination state
    page,
    pageSize,

    // Actions
    updateFilter,
    updateFilters,
    resetFilters,
    changePage,
    changePageSize,
    refresh,
  }
}
