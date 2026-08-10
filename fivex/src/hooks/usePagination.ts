import { useEffect, useMemo, useState } from 'react'

/**
 * Slices `items` into pages of `pageSize`. Pass a `resetKey` (e.g. a
 * category slug) that changes whenever the underlying dataset changes so
 * the page resets to 1 instead of pointing past the end of a shorter list.
 */
export function usePagination<T>(items: T[], pageSize: number, resetKey?: unknown) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [resetKey])

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const paginatedItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  )

  return { page: safePage, setPage, totalPages, paginatedItems }
}
