/**
 * Runs typechecks, backend syntax checks, static contract and permission
 * checks, and optionally tests and the production build. Checks run one at a
 * time to stay within the memory limit of small machines.
 */
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { PROJECT_ROOT } from '../../utils/file-system.js'
import { scanBackendRoutes, scanFrontendCalls, compareContracts, findPermissionGaps } from '../lib/contracts.js'

const HEAP_ENV = { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' }

function runCommand(label, command, args) {
  const started = Date.now()
  const result = spawnSync(command, args, { cwd: PROJECT_ROOT, env: HEAP_ENV, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()

  return {
    label,
    ok: result.status === 0,
    seconds: ((Date.now() - started) / 1000).toFixed(1),
    output: result.status === 0 ? '' : output.split('\n').slice(-40).join('\n'),
  }
}

/** Static checks that need no compiler: contract mismatches and admin permission gaps. */
export function runStaticChecks() {
  const { routes } = scanBackendRoutes()
  const frontendCalls = scanFrontendCalls()
  const { unmatchedCalls } = compareContracts(routes, frontendCalls)
  const permissionGaps = findPermissionGaps(routes)

  const results = [
    {
      label: 'API contract (frontend calls have backend routes)',
      ok: unmatchedCalls.length === 0,
      output: unmatchedCalls.map((call) => `${call.method} ${call.path} in ${path.relative(PROJECT_ROOT, call.file)}`).join('\n'),
    },
    {
      label: 'Permission guards on admin routers',
      ok: permissionGaps.length === 0,
      output: permissionGaps.map((gap) => `${gap.mount} -> ${path.relative(PROJECT_ROOT, gap.file)}`).join('\n'),
    },
  ]

  return results
}

/**
 * @param {{tests?: boolean, build?: boolean}} options
 * @returns {Array<{label: string, ok: boolean, seconds?: string, output: string}>}
 */
export function runValidation({ tests = false, build = false } = {}) {
  const results = [
    runCommand('Backend TypeScript', process.execPath, [
      path.join(PROJECT_ROOT, 'node_modules/typescript/bin/tsc'),
      '-p',
      'backend/tsconfig.json',
      '--noEmit',
    ]),
    runCommand('Frontend TypeScript', process.execPath, [
      path.join(PROJECT_ROOT, 'node_modules/typescript/bin/tsc'),
      '-p',
      'tsconfig.app.json',
      '--noEmit',
    ]),
    ...runStaticChecks(),
  ]

  if (tests) {
    results.push(runCommand('Script tests', process.execPath, ['--test', 'scripts/tests/*.test.js']))
  }

  if (build) {
    results.push(runCommand('Production build', 'npm', ['run', 'build']))
  }

  return results
}

export function renderValidation(results) {
  const lines = ['Validation', '']
  for (const result of results) {
    const time = result.seconds ? ` (${result.seconds}s)` : ''
    lines.push(`${result.ok ? 'PASS' : 'FAIL'}  ${result.label}${time}`)
    if (!result.ok && result.output) {
      lines.push(...result.output.split('\n').map((line) => `      ${line}`))
    }
  }
  lines.push('')
  lines.push(results.every((result) => result.ok) ? 'All checks passed.' : 'Some checks failed.')
  return lines.join('\n')
}
