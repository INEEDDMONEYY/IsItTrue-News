/**
 * Section registry for the Editor Dashboard → Editorial Analytics workspace.
 *
 * Each section declares the backend endpoints it depends on and the frontend
 * files and route it needs. Sections whose endpoints do not exist are reported
 * as missing backend capabilities and are never generated.
 */
import path from 'node:path'
import fs from 'node:fs'
import { PROJECT_ROOT } from '../../utils/file-system.js'
import { scanBackendRoutes, pathsMatch } from './contracts.js'

const ANALYTICS_DIR = 'src/features/editor/analytics'

export const SECTIONS = [
  {
    id: 'overview',
    title: 'Analytics Overview',
    endpoints: [{ method: 'GET', path: '/api/editorial-analytics/overview' }],
    routePath: 'analytics',
    files: [
      'src/features/editor/pages/EditorAnalyticsPage.tsx',
      `${ANALYTICS_DIR}/hooks/useEditorialAnalytics.ts`,
      `${ANALYTICS_DIR}/api/editorialAnalytics.api.ts`,
      `${ANALYTICS_DIR}/types/editorialAnalytics.types.ts`,
    ],
  },
  {
    id: 'author-performance',
    title: 'Author Performance',
    endpoints: [{ method: 'GET', path: '/api/editorial-analytics/authors' }],
    routePath: 'authors/metrics',
    component: 'AuthorPerformancePage',
    importPath: '@/features/editor/analytics/pages/AuthorPerformancePage',
    files: [`${ANALYTICS_DIR}/pages/AuthorPerformancePage.tsx`],
  },
  {
    id: 'content-quality',
    title: 'Content Quality',
    endpoints: [{ method: 'GET', path: '/api/editorial-analytics/content-quality' }],
    routePath: 'content-quality',
    component: 'ContentQualityPage',
    importPath: '@/features/editor/analytics/pages/ContentQualityPage',
    files: [`${ANALYTICS_DIR}/pages/ContentQualityPage.tsx`],
  },
  {
    id: 'editorial-workflow',
    title: 'Editorial Workflow',
    endpoints: [{ method: 'GET', path: '/api/editorial-analytics/workflow' }],
    routePath: 'editorial-workflow',
    component: 'WorkflowPage',
    importPath: '@/features/editor/analytics/pages/WorkflowPage',
    files: [`${ANALYTICS_DIR}/pages/WorkflowPage.tsx`],
  },
  {
    id: 'fact-checks',
    title: 'Fact-Check Analytics',
    endpoints: [{ method: 'GET', path: '/api/editorial-analytics/fact-checks' }],
    routePath: 'fact-check-analytics',
    component: 'FactCheckPage',
    importPath: '@/features/editor/analytics/pages/FactCheckPage',
    files: [`${ANALYTICS_DIR}/pages/FactCheckPage.tsx`],
  },
  {
    id: 'investigations',
    title: 'Investigation Analytics',
    endpoints: [{ method: 'GET', path: '/api/editorial-analytics/investigations' }],
    routePath: 'investigation-analytics',
    component: 'InvestigationPage',
    importPath: '@/features/editor/analytics/pages/InvestigationPage',
    files: [`${ANALYTICS_DIR}/pages/InvestigationPage.tsx`],
  },
  {
    id: 'article-performance',
    title: 'Article Performance',
    endpoints: [{ method: 'GET', path: '/api/editorial-analytics/article-performance' }],
    routePath: 'article-performance',
    component: 'ArticlePerformancePage',
    importPath: '@/features/editor/analytics/pages/ArticlePerformancePage',
    files: [`${ANALYTICS_DIR}/pages/ArticlePerformancePage.tsx`],
  },
  {
    id: 'reports',
    title: 'Reports & Exports',
    endpoints: [{ method: 'GET', path: '/api/editorial-analytics/reports' }],
    routePath: 'reports',
    component: 'ReportsPage',
    importPath: '@/features/editor/analytics/pages/ReportsPage',
    files: [`${ANALYTICS_DIR}/pages/ReportsPage.tsx`],
  },
]

export const SECTION_IDS = SECTIONS.map((section) => section.id)

/**
 * Status values:
 * - complete: every endpoint, frontend file and route exists
 * - incomplete: endpoints exist but frontend files or route are missing
 * - missing-backend: at least one endpoint is not implemented; nothing is generated
 */
export function inspectSections({ root = PROJECT_ROOT, routes, sectionIds } = {}) {
  const backendRoutes = routes ?? scanBackendRoutes().routes
  const routerFile = path.join(root, 'src/app/routes/index.tsx')
  const routerSource = fs.existsSync(routerFile) ? fs.readFileSync(routerFile, 'utf8') : ''
  const selected = sectionIds ? SECTIONS.filter((section) => sectionIds.includes(section.id)) : SECTIONS

  return selected.map((section) => {
    const missingEndpoints = section.endpoints.filter(
      (endpoint) => !backendRoutes.some((route) => route.method === endpoint.method && pathsMatch(route.path, endpoint.path)),
    )
    const missingFiles = section.files.filter((file) => !fs.existsSync(path.join(root, file)))
    const routeMissing = section.routePath !== null && !routerSource.includes(`path: '${section.routePath}'`)

    let status = 'complete'
    if (missingEndpoints.length > 0) status = 'missing-backend'
    else if (missingFiles.length > 0 || routeMissing) status = 'incomplete'

    return {
      id: section.id,
      title: section.title,
      status,
      missingEndpoints: missingEndpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`),
      missingFiles,
      routeMissing,
    }
  })
}

/** Throws when a requested section id is unknown. */
export function resolveSectionIds(value) {
  if (value === undefined || value === true) return undefined
  const ids = value.split(',').map((id) => id.trim()).filter(Boolean)
  const unknown = ids.filter((id) => !SECTION_IDS.includes(id))
  if (unknown.length > 0) throw new Error(`Unknown section(s): ${unknown.join(', ')}. Valid: ${SECTION_IDS.join(', ')}`)
  return ids
}
