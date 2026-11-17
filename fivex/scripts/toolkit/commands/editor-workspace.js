/**
 * Editor Workspace generator. Inspects the registry in lib/editor-workspace.js
 * and the sidebar links, reports blocked and incomplete sections, and (only with
 * --register) adds routes whose page already exists. It never creates pages,
 * never invents endpoints, and never overwrites files.
 */
import path from 'node:path'
import { PROJECT_ROOT } from '../../utils/file-system.js'
import { createPlan, executePlan, renderReport } from '../lib/plan.js'
import {
  SECTIONS,
  inspectSections,
  resolveSectionIds,
  routerRegistrationPatch,
  scanNavLinks,
} from '../lib/editor-workspace.js'

const ROUTER_FILE = 'src/app/routes/index.tsx'

/**
 * @param {{ sections?: string, dryRun?: boolean, register?: boolean }} options
 * @returns {{ exitCode: number, output: string, inspection: object[], nav: object }}
 */
export function runEditorWorkspace({ sections, dryRun = false, register = false } = {}, root = PROJECT_ROOT) {
  const sectionIds = resolveSectionIds(sections)
  const inspection = inspectSections({ root, sectionIds })
  const nav = scanNavLinks({ root })
  const lines = ['Editor Workspace generator', '=========================']

  for (const item of inspection) {
    lines.push(`- ${item.title}: ${item.status}`)
    if (item.blockedReason) lines.push(`    blocked: ${item.blockedReason}`)
    if (item.missingFiles.length) lines.push(`    missing or empty files: ${item.missingFiles.join(', ')}`)
    if (item.routeMissing) lines.push(`    route not registered in ${ROUTER_FILE}`)
  }

  lines.push('')
  if (nav.broken.length) {
    lines.push(`Broken sidebar links (no matching route): ${nav.broken.map((link) => `/dashboard/${link}`).join(', ')}`)
  } else {
    lines.push(`Sidebar links: ${nav.links.length} checked, all routed.`)
  }

  const plan = createPlan()
  if (register) {
    for (const item of inspection) {
      const section = SECTIONS.find((s) => s.id === item.id)
      if (item.status === 'incomplete' && item.routeMissing && item.missingFiles.length === 0 && section.component) {
        plan.addPatch(path.join(root, ROUTER_FILE), routerRegistrationPatch(section))
      }
    }
  }

  if (plan.operations.length > 0) {
    const result = executePlan(plan, { dryRun })
    lines.push(renderReport(`Registration${dryRun ? ' (dry run)' : ''}`, result))
    return { exitCode: result.ok ? 0 : 1, output: lines.join('\n'), inspection, nav }
  }

  const incomplete = inspection.filter((item) => item.status === 'incomplete')
  const blocked = inspection.filter((item) => item.status === 'blocked')
  lines.push(
    `Summary: ${inspection.length - incomplete.length - blocked.length} complete, ${incomplete.length} incomplete, ${blocked.length} blocked.`,
  )
  if (incomplete.length && !register) lines.push('Run with --register to add missing routes whose pages already exist.')

  return { exitCode: nav.broken.length === 0 ? 0 : 1, output: lines.join('\n'), inspection, nav }
}
