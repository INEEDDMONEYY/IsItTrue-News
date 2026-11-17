#!/usr/bin/env node
/**
 * Full-stack toolkit CLI.
 *
 * Exit codes: 0 success, 1 findings, conflicts, or failed checks, 2 usage errors.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runGenerate } from './commands/generate.js'
import { runMaintenance, countFindings, renderMaintenance, writeReport } from './commands/maintain.js'
import { runValidation, renderValidation, runStaticChecks } from './commands/validate.js'
import { runEditorialAnalytics } from './commands/editorial-analytics.js'
import { runAnalyticsMaintenance, countAnalyticsFindings, renderAnalyticsMaintenance } from './commands/editorial-analytics-maintain.js'
import { runEditorWorkspace } from './commands/editor-workspace.js'
import { runGlobalLocation } from './commands/global-location.js'
import { PROJECT_ROOT } from '../utils/file-system.js'

const USAGE = `IsItTrue toolkit

Generation (dry-run with --dry-run; existing files are never overwritten):
  backend-crud   --name=<kebab-name> [--fields=title:string,count:number] [--scope=admin|public-read]
                 [--backend-dir=modules/<name>] [--register] [--dry-run]
  frontend-crud  --name=<kebab-name> [--fields=...] [--scope=...] [--frontend-dir=features/<name>] [--dry-run]
  fullstack      Both of the above. --register mounts the backend router in backend/app.ts (backup written first).

Maintenance (read-only):
  editorial-analytics [--section=<ids>] [--dry-run] [--register]
                 Inspects Editorial Analytics sections and reports missing backend endpoints. --register
                 (opt-in) adds routes only for pages that already exist.
  editorial-analytics-scan [--json]
                 Delegates to the import, route and unused-file checks, filtered to Editorial Analytics.
  editor-workspace [--section=<ids>] [--dry-run] [--register]
                 Inspects Editor Workspace sections and checks every sidebar link resolves to a route.
                 --register (opt-in) adds routes only for pages that already exist.
  global-location [--dry-run] [--register]
                 Validates the location contract and seed, then creates the locations backend module,
                 frontend feature, and seed copy. Never overwrites files. Reports header status only.
                 --register (opt-in) mounts /api/locations in backend/app.ts.

Maintenance (read-only):
  maintain       [--json] [--report=<file>]   Duplicates, missing tests, unregistered routers, guards, contracts.
  contracts      Only the frontend/backend API contract and admin guard checks.

Validation:
  validate       [--tests] [--build]          Backend and frontend typechecks, static checks, optional tests and build.

Other:
  help           Show this message.
`

/** Parses argv into a command, positional arguments, and flags. `--key=value` and `--flag` are supported. */
export function parseArgs(argv) {
  const [command = 'help', ...rest] = argv
  const flags = {}
  const positionals = []

  for (const arg of rest) {
    if (!arg.startsWith('--')) {
      positionals.push(arg)
      continue
    }
    const body = arg.slice(2)
    const eq = body.indexOf('=')
    if (eq === -1) flags[body] = true
    else flags[body.slice(0, eq)] = body.slice(eq + 1)
  }

  return { command, positionals, flags }
}

const GENERATE_MODES = { 'backend-crud': 'backend', 'frontend-crud': 'frontend', fullstack: 'fullstack' }

/** Runs one command and returns its exit code and printable output. */
export function execute(argv) {
  const { command, flags } = parseArgs(argv)

  if (command === 'help' || command === '--help') return { exitCode: 0, output: USAGE }

  if (command in GENERATE_MODES) {
    if (typeof flags.name !== 'string') return { exitCode: 2, output: `Missing --name.\n\n${USAGE}` }
    try {
      const { exitCode, output } = runGenerate(GENERATE_MODES[command], flags)
      return { exitCode, output }
    } catch (error) {
      return { exitCode: 2, output: `Error: ${error.message}` }
    }
  }

  if (command === 'editorial-analytics') {
    try {
      const { exitCode, output } = runEditorialAnalytics({
        sections: typeof flags.section === 'string' ? flags.section : undefined,
        dryRun: Boolean(flags['dry-run']),
        register: Boolean(flags.register),
      })
      return { exitCode, output }
    } catch (error) {
      return { exitCode: 2, output: `Error: ${error.message}` }
    }
  }

  if (command === 'editor-workspace') {
    try {
      const { exitCode, output } = runEditorWorkspace({
        sections: typeof flags.section === 'string' ? flags.section : undefined,
        dryRun: Boolean(flags['dry-run']),
        register: Boolean(flags.register),
      })
      return { exitCode, output }
    } catch (error) {
      return { exitCode: 2, output: `Error: ${error.message}` }
    }
  }

  if (command === 'global-location') {
    try {
      const { exitCode, output } = runGlobalLocation({
        dryRun: Boolean(flags['dry-run']),
        register: Boolean(flags.register),
      })
      return { exitCode, output }
    } catch (error) {
      return { exitCode: 2, output: `Error: ${error.message}` }
    }
  }

  if (command === 'editorial-analytics-scan') {
    const result = runAnalyticsMaintenance()
    const output = flags.json ? JSON.stringify(result, null, 2) : renderAnalyticsMaintenance(result)
    return { exitCode: countAnalyticsFindings(result) === 0 ? 0 : 1, output }
  }

  if (command === 'maintain') {
    const result = runMaintenance()
    if (typeof flags.report === 'string') writeReport(result, path.resolve(PROJECT_ROOT, flags.report))
    const output = flags.json ? JSON.stringify(result, null, 2) : renderMaintenance(result)
    return { exitCode: countFindings(result) === 0 ? 0 : 1, output }
  }

  if (command === 'contracts') {
    const results = runStaticChecks().filter((result) => /contract|guard/i.test(result.label))
    const output = results.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.label}${r.output ? `\n${r.output}` : ''}`).join('\n')
    return { exitCode: results.every((r) => r.ok) ? 0 : 1, output }
  }

  if (command === 'validate') {
    const results = runValidation({ tests: Boolean(flags.tests), build: Boolean(flags.build) })
    return { exitCode: results.every((r) => r.ok) ? 0 : 1, output: renderValidation(results) }
  }

  return { exitCode: 2, output: `Unknown command "${command}".\n\n${USAGE}` }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  const { exitCode, output } = execute(process.argv.slice(2))
  process.stdout.write(`${output}\n`)
  process.exitCode = exitCode
}
