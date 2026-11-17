/**
 * Editorial Analytics generator. Inspects the registry in
 * lib/editorial-analytics.js, reports sections whose backend or frontend parts
 * are missing, and (only with --register) adds missing routes whose page
 * already exists. It never generates placeholder pages or invents endpoints.
 */
import fs from 'node:fs'
import path from 'node:path'
import { PROJECT_ROOT } from '../../utils/file-system.js'
import { createPlan, executePlan, renderReport } from '../lib/plan.js'
import { SECTIONS, inspectSections, resolveSectionIds } from '../lib/editorial-analytics.js'


const ROUTER_FILE = 'src/app/routes/index.tsx'
const ANCHOR = `{ path: 'analytics', element: <DashboardAnalyticsPage /> },`

/** Adds the import and child route for a section. Idempotent. */
export function routerRegistrationPatch(section) {
  return (source) => {
    if (source.includes(`path: '${section.routePath}'`)) {
      return { content: source, changed: false, reason: 'route already registered' }
    }
    if (!source.includes(ANCHOR)) {
      throw new Error(`Router anchor not found; register "${section.routePath}" manually.`)
    }

    const importLine = `import { ${section.component} } from '${section.importPath}'`
    const lines = source.split('\n')
    const lastImport = lines.reduce((index, line, i) => (line.startsWith('import ') ? i : index), -1)

    let next = source
    if (!source.includes(importLine)) {
      lines.splice(lastImport + 1, 0, importLine)
      next = lines.join('\n')
    }
    next = next.replace(ANCHOR, `{ path: '${section.routePath}', element: <${section.component} /> },\n          ${ANCHOR}`)
    return { content: next, changed: true, reason: 'route added' }
  }
}

/**
 * @param {{ sections?: string, dryRun?: boolean, register?: boolean }} options
 * @returns {{ exitCode: number, output: string, inspection: object[] }}
 */
export function runEditorialAnalytics({ sections, dryRun = false, register = false } = {}, root = PROJECT_ROOT) {
  const sectionIds = resolveSectionIds(sections)
  const inspection = inspectSections({ root, sectionIds })
  const lines = ['Editorial Analytics generator', '============================']

  for (const item of inspection) {
    lines.push(`- ${item.title}: ${item.status}`)
    if (item.missingEndpoints.length) lines.push(`    missing backend: ${item.missingEndpoints.join(', ')}`)
    if (item.missingFiles.length) lines.push(`    missing frontend files: ${item.missingFiles.join(', ')}`)
    if (item.routeMissing) lines.push(`    route not registered in ${ROUTER_FILE}`)
  }

  const plan = createPlan()
  const routerAbs = path.join(root, ROUTER_FILE)

  if (register) {
    for (const item of inspection) {
      const section = SECTIONS.find((s) => s.id === item.id)
      const pageExists = section.files.length > 0 && section.files.every((file) => fs.existsSync(path.join(root, file)))
      if (item.status === 'incomplete' && item.routeMissing && item.missingFiles.length === 0 && pageExists) {
        plan.addPatch(routerAbs, routerRegistrationPatch(section))
      }
    }
  }

  if (plan.operations.length > 0) {
    const result = executePlan(plan, { dryRun })
    lines.push(renderReport(`Registration${dryRun ? ' (dry run)' : ''}`, result))
    const exitCode = result.ok ? 0 : 1
    return { exitCode, output: lines.join('\n'), inspection }
  }

  const blocked = inspection.filter((item) => item.status === 'missing-backend')
  const incomplete = inspection.filter((item) => item.status === 'incomplete')
  lines.push('')
  lines.push(
    `Summary: ${inspection.length - blocked.length - incomplete.length} complete, ${incomplete.length} incomplete, ${blocked.length} missing backend.`,
  )
  if (blocked.length) lines.push('Sections without backend endpoints were not generated. Add the endpoints before generating them.')
  if (incomplete.length && !register) lines.push('Run with --register to add missing routes whose pages already exist.')

  return { exitCode: 0, output: lines.join('\n'), inspection }
}
