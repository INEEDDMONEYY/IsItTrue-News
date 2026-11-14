
import { useCallback, useEffect, useState } from 'react'

import {
  getCaseFileById,
  updateCaseFile,
} from '../api/caseFiles.api'

import type {
  CaseFile,
  UpdateCaseFileInput,
} from '../types/caseFile.types'

interface UseCaseFileOptions {
  autoFetch?: boolean
}

export const useCaseFile = (
  id?: string,
  { autoFetch = true }: UseCaseFileOptions = {},
) => {
  const [caseFile, setCaseFile] = useState<CaseFile | null>(null)
  const [loading, setLoading] = useState(Boolean(id) && autoFetch)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!autoFetch || !id) {
      setCaseFile(null)
      setLoading(false)
      return
    }

    let active = true

    const fetchCaseFile = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await getCaseFileById(id)

        if (!active) return

        if (!result) {
          setCaseFile(null)
          setError('Case file not found.')
          return
        }

        setCaseFile(result)
      } catch (err) {
        if (!active) return

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load this case file.',
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchCaseFile()

    return () => {
      active = false
    }
  }, [id, autoFetch, refreshKey])

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1)
  }, [])

  const update = useCallback(
    async (input: UpdateCaseFileInput) => {
      if (!id) {
        throw new Error('A case-file ID is required to update this record.')
      }

      setSaving(true)
      setError(null)

      try {
        const updated = await updateCaseFile(id, input)
        setCaseFile(updated)
        return updated
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to update this case file.'

        setError(message)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [id],
  )

  return {
    caseFile,
    loading,
    saving,
    error,
    refresh,
    update,
  }
}

export default useCaseFile
