
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  archiveCaseFile,
  createCaseFile,
  deleteCaseFile,
  getCaseFileActors,
  getCaseFileSummary,
  getCaseFiles,
  updateCaseFile,
} from '../api/caseFiles.api'

import type {
  CaseFile,
  CaseFileActor,
  CaseFileFilters,
  CaseFileQueryParams,
  CaseFileSummary,
  CreateCaseFileInput,
  UpdateCaseFileInput,
  CaseFilePagination,
} from '../types/caseFile.types'

const DEFAULT_FILTERS: CaseFileFilters = {
  search: '',
  status: 'all',
  category: 'all',
  priority: 'all',
  accessLevel: 'all',
  investigatorId: '',
  sortOrder: 'newest',
}

const DEFAULT_SUMMARY: CaseFileSummary = {
  totalCases: 0,
  activeCases: 0,
  pendingReview: 0,
  closedCases: 0,
  criticalCases: 0,
  confidentialCases: 0,
}

const DEFAULT_PAGINATION: CaseFilePagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
}

interface UseCaseFilesOptions {
  initialPageSize?: number
  autoFetch?: boolean
}

export const useCaseFiles = ({
  initialPageSize = 10,
  autoFetch = true,
}: UseCaseFilesOptions = {}) => {
  const [filters, setFilters] = useState<CaseFileFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([])
  const [pagination, setPagination] =
    useState<CaseFilePagination>(DEFAULT_PAGINATION)

  const [summary, setSummary] =
    useState<CaseFileSummary>(DEFAULT_SUMMARY)

  const [actors, setActors] = useState<CaseFileActor[]>([])

  const [loading, setLoading] = useState(autoFetch)
  const [summaryLoading, setSummaryLoading] = useState(autoFetch)
  const [actorsLoading, setActorsLoading] = useState(autoFetch)

  const [error, setError] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [actorsError, setActorsError] = useState<string | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)

  const queryParams = useMemo<CaseFileQueryParams>(
    () => ({
      ...filters,
      page,
      pageSize,
    }),
    [filters, page, pageSize],
  )

  useEffect(() => {
    if (!autoFetch) return

    let active = true

    const fetchCaseFiles = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getCaseFiles(queryParams)

        if (!active) return

        setCaseFiles(response.data)
        setPagination(response.pagination)
      } catch (err) {
        if (!active) return

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load case files.',
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchCaseFiles()

    return () => {
      active = false
    }
  }, [autoFetch, queryParams, refreshKey])

  useEffect(() => {
    if (!autoFetch) return

    let active = true

    const fetchSummary = async () => {
      setSummaryLoading(true)
      setSummaryError(null)

      try {
        const result = await getCaseFileSummary()

        if (active) setSummary(result)
      } catch (err) {
        if (!active) return

        setSummaryError(
          err instanceof Error
            ? err.message
            : 'Unable to load case-file summary.',
        )
      } finally {
        if (active) setSummaryLoading(false)
      }
    }

    void fetchSummary()

    return () => {
      active = false
    }
  }, [autoFetch, refreshKey])

  useEffect(() => {
    if (!autoFetch) return

    let active = true

    const fetchActors = async () => {
      setActorsLoading(true)
      setActorsError(null)

      try {
        const result = await getCaseFileActors()

        if (active) setActors(result)
      } catch (err) {
        if (!active) return

        setActorsError(
          err instanceof Error
            ? err.message
            : 'Unable to load investigators.',
        )
      } finally {
        if (active) setActorsLoading(false)
      }
    }

    void fetchActors()

    return () => {
      active = false
    }
  }, [autoFetch, refreshKey])

  const updateFilter = useCallback(
    <K extends keyof CaseFileFilters>(
      key: K,
      value: CaseFileFilters[K],
    ) => {
      setFilters((current) => ({
        ...current,
        [key]: value,
      }))
      setPage(1)
    },
    [],
  )

  const updateFilters = useCallback(
    (updates: Partial<CaseFileFilters>) => {
      setFilters((current) => ({
        ...current,
        ...updates,
      }))
      setPage(1)
    },
    [],
  )

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [])

  const changePage = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage))
  }, [])

  const changePageSize = useCallback((nextPageSize: number) => {
    setPageSize(Math.max(1, nextPageSize))
    setPage(1)
  }, [])

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1)
  }, [])

  const addCaseFile = useCallback(
    async (input: CreateCaseFileInput) => {
      const created = await createCaseFile(input)
      refresh()
      return created
    },
    [refresh],
  )

  const editCaseFile = useCallback(
    async (id: string, input: UpdateCaseFileInput) => {
      const updated = await updateCaseFile(id, input)
      refresh()
      return updated
    },
    [refresh],
  )

  const archive = useCallback(
    async (id: string) => {
      const archived = await archiveCaseFile(id)
      refresh()
      return archived
    },
    [refresh],
  )

  const removeCaseFile = useCallback(
    async (id: string) => {
      await deleteCaseFile(id)
      refresh()
    },
    [refresh],
  )

  const hasActiveFilters = useMemo(
    () =>
      filters.search.trim() !== '' ||
      filters.status !== 'all' ||
      filters.category !== 'all' ||
      filters.priority !== 'all' ||
      filters.accessLevel !== 'all' ||
      filters.investigatorId !== '',
    [filters],
  )

  return {
    caseFiles,
    pagination,
    summary,
    actors,

    filters,
    queryParams,

    loading,
    summaryLoading,
    actorsLoading,

    error,
    summaryError,
    actorsError,

    hasActiveFilters,

    updateFilter,
    updateFilters,
    resetFilters,
    changePage,
    changePageSize,

    addCaseFile,
    editCaseFile,
    archiveCaseFile: archive,
    deleteCaseFile: removeCaseFile,

    refresh,
  }
}

export default useCaseFiles
