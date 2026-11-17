/**
 * Editorial Analytics maintenance scan. Runs the existing import, route, and
 * unused-file checks (via maintain.js) and keeps only findings that touch the
 * analytics feature. The delegated checks are not reimplemented here.
 */
import { PROJECT_ROOT } from '../../utils/file-system.js'
import { inspectSections } from '../lib/editorial-analytics.js'
import { runDelegatedChecks } from './maintain.js'

const ANALYTICS_PATH = /editorial-analytics|features\/editor\/analytics|EditorAnalyticsPage|ContentQualityPage|AuthorPerformancePage|EditorialAnalytics/i
const FINDING_KEYS = ['missingImports', 'duplicateRoutes', 'unresolvedImports', 'unreferencedPages', 'unusedFileCandidates']

export function runAnalyticsMaintenance(root = PROJECT_ROOT) {
  const checks = runDelegatedChecks()
  const matches = (value) => ANALYTICS_PATH.test(typeof value === 'string' ? value : JSON.stringify(value))

  const result = Object.fromEntries(FINDING_KEYS.map((key) => [key, checks[key].filter(matches)]))
  result.incompleteSections = inspectSections({ root })
    .filter((item) => item.status === 'incomplete')
    .map((item) => item.id)
  result.failures = checks.failures
  return result
}

export function countAnalyticsFindings(result) {
  return [...FINDING_KEYS, 'incompleteSections', 'failures'].reduce((total, key) => total + result[key].length, 0)
}

export function renderAnalyticsMaintenance(result) {
  const lines = ['Editorial Analytics maintenance', '==============================']
  for (const key of [...FINDING_KEYS, 'incompleteSections', 'failures']) {
    lines.push(`${key}: ${result[key].length}`)
    for (const item of result[key]) lines.push(`  - ${typeof item === 'string' ? item : JSON.stringify(item)}`)
  }
  lines.push(countAnalyticsFindings(result) === 0 ? 'Status: clean' : 'Status: findings reported')
  return lines.join('\n')
}
