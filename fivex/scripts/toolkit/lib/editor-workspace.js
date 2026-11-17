/**
 * Section registry for the Editor Dashboard → Workspace.
 *
 * Each section declares the backend endpoints it reads, the frontend files and
 * route it needs, and the nav entry that points at it. Sections without a
 * backend capability or source model are reported as blocked and never generated.
 */
import path from 'node:path'
import fs from 'node:fs'
import { PROJECT_ROOT } from '../../utils/file-system.js'

const ROUTER_FILE = 'src/app/routes/index.tsx'
const NAV_FILE = 'src/features/dashboard/constants/dashboardNav.ts'
export const WORKSPACE_ANCHOR = "{ path: 'calendar', element: <EditorialCalendarPage /> },"

export const SECTIONS = [
  {
    id: 'calendar',
    title: 'Editorial Calendar',
    routePath: 'calendar',
    endpoints: [
      { method: 'GET', path: '/api/articles/editorial-workflow' },
      { method: 'GET', path: '/api/investigations/editorial-workflow' },
    ],
    files: [
      'src/features/editor/pages/EditorialCalendarPage.tsx',
      'src/features/editor/components/EditorialCalendar.tsx',
    ],
  },
  {
    id: 'workspace',
    title: 'Workspace',
    routePath: 'work-space',
    component: 'EditorWorkspacePage',
    importPath: '@/features/editor/pages/EditorWorkspacePage',
    endpoints: [],
    files: ['src/features/editor/pages/EditorWorkspacePage.tsx'],
  },
  {
    id: 'fact-check-oversight',
    title: 'Fact Check Oversight',
    routePath: 'fact-check-oversight',
    endpoints: [
      { method: 'GET', path: '/api/claims' },
      { method: 'GET', path: '/api/claims/articles' },
    ],
    files: ['src/features/editor/pages/FactCheckOversightPage.tsx'],
  },
  {
    id: 'investigation-oversight',
    title: 'Investigation Oversight',
    routePath: 'investigation-oversight',
    component: 'InvestigationReviewPage',
    importPath: '@/features/admin/investigations/pages/InvestigationReviewPage',
    endpoints: [{ method: 'GET', path: '/api/investigations/review-queue' }],
    files: ['src/features/admin/investigations/pages/InvestigationReviewPage.tsx'],
  },
  {
    id: 'flagged',
    title: 'Flagged Articles (Corrections)',
    routePath: 'flagged',
    component: 'CorrectionsManagementPage',
    importPath: '@/features/corrections/pages/CorrectionsManagementPage',
    endpoints: [{ method: 'GET', path: '/api/corrections' }],
    files: ['src/features/corrections/pages/CorrectionsManagementPage.tsx'],
  },
  {
    id: 'team-assignments',
    title: 'Team Assignments',
    routePath: null,
    endpoints: [],
    files: [],
    blockedReason: 'No backend endpoint or page exists. Not in navigation.',
  },
  {
    id: 'source-verification',
    title: 'Source Verification',
    routePath: null,
    endpoints: [],
    files: [],
    blockedReason: 'No source model or sources backend module exists. Not in navigation.',
  },
]

export const SECTION_IDS = SECTIONS.map((section) => section.id)

/** Throws when a requested section id is unknown. */
export function resolveSectionIds(value) {
  if (value === undefined || value === true) return undefined
  const ids = value.split(',').map((id) => id.trim()).filter(Boolean)
  const unknown = ids.filter((id) => !SECTION_IDS.includes(id))
  if (unknown.length > 0) throw new Error(`Unknown section(s): ${unknown.join(', ')}. Valid: ${SECTION_IDS.join(', ')}`)
  return ids
}

/** True when the file exists and is non-empty (0-byte placeholders count as missing). */
function hasContent(absPath) {
  return fs.existsSync(absPath) && fs.statSync(absPath).size > 0
}

/**
 * Status values:
 * - blocked: a backend capability or source model is missing; nothing is generated
 * - incomplete: files or route are missing
 * - complete: files and route exist
 */
export function inspectSections({ root = PROJECT_ROOT, sectionIds } = {}) {
  const routerSource = readOrEmpty(path.join(root, ROUTER_FILE))
  const selected = sectionIds ? SECTIONS.filter((section) => sectionIds.includes(section.id)) : SECTIONS

  return selected.map((section) => {
    const missingFiles = section.files.filter((file) => !hasContent(path.join(root, file)))
    const routeMissing = section.routePath !== null && !routerSource.includes(`path: '${section.routePath}'`)

    let status = 'complete'
    if (section.blockedReason) status = 'blocked'
    else if (missingFiles.length > 0 || routeMissing) status = 'incomplete'

    return {
      id: section.id,
      title: section.title,
      status,
      blockedReason: section.blockedReason ?? null,
      missingFiles,
      routeMissing,
    }
  })
}

/**
 * Sidebar-to-route scan. Every `/dashboard/...` link in the nav must match a
 * registered child route in the router, otherwise the link lands on the 404 page.
 */
export function scanNavLinks({ root = PROJECT_ROOT } = {}) {
  const navSource = readOrEmpty(path.join(root, NAV_FILE))
  const routerSource = readOrEmpty(path.join(root, ROUTER_FILE))
  const links = [...new Set([...navSource.matchAll(/to:\s*'\/dashboard\/([^'/][^']*)'/g)].map((m) => m[1]))]
  const broken = links.filter((link) => !routerSource.includes(`path: '${link}'`))
  return { links, broken }
}

/** Adds one route before the workspace anchor. Idempotent: a registered route is left unchanged. */
export function routerRegistrationPatch(section) {
  return (source) => {
    if (source.includes(`path: '${section.routePath}'`)) {
      return { content: source, changed: false, reason: 'route already registered' }
    }
    if (!source.includes(WORKSPACE_ANCHOR)) {
      throw new Error(`Router anchor not found; register "${section.routePath}" manually.`)
    }

    const lines = source.split('\n')
    const importLine = `import { ${section.component} } from '${section.importPath}'`
    if (!source.includes(importLine)) {
      const lastImport = lines.reduce((index, line, i) => (line.startsWith('import ') ? i : index), -1)
      lines.splice(lastImport + 1, 0, importLine)
    }
    const next = lines.join('\n').replace(
      WORKSPACE_ANCHOR,
      `{ path: '${section.routePath}', element: <${section.component} /> },\n          ${WORKSPACE_ANCHOR}`,
    )
    return { content: next, changed: true, reason: 'route added' }
  }
}

function readOrEmpty(absPath) {
  return fs.existsSync(absPath) ? fs.readFileSync(absPath, 'utf8') : ''
}
