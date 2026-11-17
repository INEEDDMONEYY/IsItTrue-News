/**
 * Read-only maintenance scan. Reports findings; never edits files.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { PROJECT_ROOT, listFiles } from '../../utils/file-system.js'
import {
  BACKEND_ROOT,
  SRC_ROOT,
  scanBackendRoutes,
  scanFrontendCalls,
  compareContracts,
  findPermissionGaps,
  findUnregisteredRouteModules,
} from '../lib/contracts.js'

const TEST_PATTERN = /\.(test|spec)\.[jt]sx?$/

function hasTestUnder(dir) {
  return listFiles(dir, { extensions: ['.ts', '.tsx', '.js', '.jsx'] }).some((file) => TEST_PATTERN.test(file))
}

/** Duplicate source files in src/ by identical content hash. */
export function findDuplicateFiles(srcRoot = SRC_ROOT) {
  const byHash = new Map()

  for (const file of listFiles(srcRoot, { extensions: ['.ts', '.tsx'] })) {
    const content = fs.readFileSync(file)
    if (content.length === 0) continue
    const hash = crypto.createHash('sha256').update(content).digest('hex')
    byHash.set(hash, [...(byHash.get(hash) ?? []), file])
  }

  return [...byHash.values()]
    .filter((group) => group.length > 1)
    .map((group) => group.map((file) => path.relative(PROJECT_ROOT, file)))
}

/** Feature folders and backend modules with no test file anywhere beneath them. */
export function findMissingTests() {
  const findings = []

  const featuresDir = path.join(SRC_ROOT, 'features')
  if (fs.existsSync(featuresDir)) {
    for (const entry of fs.readdirSync(featuresDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const dir = path.join(featuresDir, entry.name)
      if (!hasTestUnder(dir)) findings.push(path.relative(PROJECT_ROOT, dir))
    }
  }

  const modulesDir = path.join(BACKEND_ROOT, 'modules')
  if (fs.existsSync(modulesDir)) {
    for (const entry of fs.readdirSync(modulesDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const dir = path.join(modulesDir, entry.name)
      if (!hasTestUnder(dir)) findings.push(path.relative(PROJECT_ROOT, dir))
    }
  }

  return findings
}

const MAINTENANCE_DIR = path.join(PROJECT_ROOT, 'scripts/maintenance/frontend')
const DELEGATED_CHECKS = { imports: 'check-imports', routes: 'check-routes', unusedFiles: 'check-unused-files' }

/**
 * Extracts the JSON object that starts at a line `{` and ends at the first
 * line `}`. Some maintenance scripts print a text summary after their JSON.
 */
export function parseLeadingJson(stdout) {
  const lines = stdout.split('\n')
  const start = lines.indexOf('{')
  const end = lines.indexOf('}', start + 1)
  if (start === -1 || end === -1) throw new Error('no JSON object found in output')

  return JSON.parse(lines.slice(start, end + 1).join('\n'))
}

/** Runs an existing maintenance script in read-only JSON mode (no --write-report). */
function runDelegated(scriptName) {
  const result = spawnSync(process.execPath, [path.join(MAINTENANCE_DIR, `${scriptName}.js`), '--json'], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })

  try {
    return { ok: true, data: parseLeadingJson(result.stdout ?? '') }
  } catch (error) {
    const stderr = (result.stderr ?? '').trim().split('\n').slice(-3).join(' | ')
    return { ok: false, error: `exit ${result.status}: ${error.message}${stderr ? ` (${stderr})` : ''}` }
  }
}

/** Delegates to check-imports, check-routes and check-unused-files, and normalises their findings. */
export function runDelegatedChecks() {
  const runs = Object.fromEntries(Object.entries(DELEGATED_CHECKS).map(([key, script]) => [key, runDelegated(script)]))
  const data = (key) => (runs[key].ok ? runs[key].data : {})

  return {
    missingImports: data('imports').missingImports ?? [],
    duplicateRoutes: data('routes').duplicateRoutes ?? [],
    unresolvedImports: data('routes').unresolvedImports ?? [],
    unreferencedPages: data('routes').unreferencedPages ?? [],
    unusedFileCandidates: data('unusedFiles').candidates ?? [],
    failures: Object.entries(runs)
      .filter(([, run]) => !run.ok)
      .map(([key, run]) => ({ check: DELEGATED_CHECKS[key], error: run.error })),
  }
}

/**
 * Runs all native maintenance checks plus the delegated ones.
 * @returns {{ duplicates: string[][], missingTests: string[], unregistered: Array<{file: string, exports: string[]}>, permissionGaps: Array<{mount: string, file: string}>, contracts: {unmatchedCalls: object[], unusedRoutes: object[]} }}
 */
export function runMaintenance() {
  const { routes, visitedFiles } = scanBackendRoutes()
  const frontendCalls = scanFrontendCalls()
  const { unmatchedCalls, unusedRoutes } = compareContracts(routes, frontendCalls)

  return {
    duplicates: findDuplicateFiles(),
    missingTests: findMissingTests(),
    unregistered: findUnregisteredRouteModules(visitedFiles).map((entry) => ({
      file: path.relative(PROJECT_ROOT, entry.file),
      exports: entry.exports,
    })),
    permissionGaps: findPermissionGaps(routes).map((gap) => ({ mount: gap.mount, file: path.relative(PROJECT_ROOT, gap.file) })),
    contracts: { unmatchedCalls, unusedRoutes },
    delegated: runDelegatedChecks(),
  }
}

export function countFindings(result) {
  const native =
    result.duplicates.length +
    result.missingTests.length +
    result.unregistered.length +
    result.permissionGaps.length +
    result.contracts.unmatchedCalls.length +
    result.contracts.unusedRoutes.length

  return native + Object.values(result.delegated).reduce((total, list) => total + list.length, 0)
}

export function renderMaintenance(result) {
  const lines = ['Maintenance scan (read-only)', '']
  const section = (title, items, format) => {
    lines.push(`${title}: ${items.length}`)
    for (const item of items) lines.push(`  - ${format(item)}`)
    lines.push('')
  }

  section('Duplicate source files', result.duplicates, (group) => group.join(' == '))
  section('Missing tests', result.missingTests, (item) => item)
  section('Unregistered backend route modules', result.unregistered, (item) => `${item.file} (${item.exports.join(', ')})`)
  section('Admin routers without auth guard', result.permissionGaps, (item) => `${item.mount} -> ${item.file}`)
  section(
    'Frontend calls with no backend route',
    result.contracts.unmatchedCalls,
    (call) => `${call.method} ${call.path} (${path.relative(PROJECT_ROOT, call.file)})`,
  )
  section(
    'Backend routes with no frontend caller',
    result.contracts.unusedRoutes,
    (route) => `${route.method} ${route.path} (${path.relative(PROJECT_ROOT, route.file)})`,
  )
  const { delegated } = result
  const text = (item) => (typeof item === 'string' ? item : JSON.stringify(item))
  section('Missing imports (check-imports)', delegated.missingImports, (item) => `${item.reference} (imported by ${item.importer})`)
  section('Duplicate routes (check-routes)', delegated.duplicateRoutes, (item) => `${item.path}: ${item.files.join(', ')}`)
  section('Unresolved imports (check-routes)', delegated.unresolvedImports, text)
  section('Unreferenced pages (check-routes)', delegated.unreferencedPages, text)
  section('Unused file candidates (check-unused-files)', delegated.unusedFileCandidates, text)
  section('Delegated checks that failed to run', delegated.failures, (item) => `${item.check}: ${item.error}`)
  lines.push(`Total findings: ${countFindings(result)}`)
  return lines.join('\n')
}

/** Used by the CLI: writes JSON to a report file when requested. */
export function writeReport(result, reportPath) {
  fs.writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`)
}
