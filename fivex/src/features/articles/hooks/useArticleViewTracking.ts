import { useEffect } from 'react'
import { articleViewsApi } from '../api/articleViews.api'

/**
 * Records one view per page load for a real article, then sends the time spent with the tab visible.
 * Time is only counted while the page is visible, so background tabs don't inflate reading time.
 */
export function useArticleViewTracking(articleId: string | undefined) {
  useEffect(() => {
    if (!articleId) return

    let viewId: string | null = null
    let visibleSince: number | null = document.visibilityState === 'visible' ? performance.now() : null
    let activeMs = 0
    let flushed = false

    const pauseTimer = () => {
      if (visibleSince !== null) {
        activeMs += performance.now() - visibleSince
        visibleSince = null
      }
    }

    const flush = () => {
      pauseTimer()
      if (flushed || !viewId || activeMs <= 0) return
      flushed = true
      articleViewsApi.recordReadingTime(articleId, viewId, activeMs / 1000)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        visibleSince = performance.now()
      } else {
        flush()
      }
    }

    articleViewsApi
      .recordView(articleId)
      .then(({ viewId: id }) => {
        viewId = id
      })
      .catch(() => undefined)

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [articleId])
}
