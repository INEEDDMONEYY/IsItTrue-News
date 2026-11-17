/**
 * Generates backend CRUD modules, frontend CRUD feature files, or both.
 * Everything goes through one plan: any conflict stops the run before a write.
 */
import path from 'node:path'
import { PROJECT_ROOT } from '../../utils/file-system.js'
import { createPlan, executePlan, renderReport, resolveDestination } from '../lib/plan.js'
import { parseFields, toCamel, toPascal, validateName } from '../lib/names.js'
import { BACKEND_SCOPES, backendFiles } from '../templates/backend.js'
import { apiBasePath, frontendFiles } from '../templates/frontend.js'

const BACKEND_ROOT = path.join(PROJECT_ROOT, 'backend')
const SRC_ROOT = path.join(PROJECT_ROOT, 'src')
const APP_FILE = path.join(BACKEND_ROOT, 'app.ts')
const TOP_LEVEL_CODE = /^(export |const |function )/m

function resolveOptions(opts) {
  const name = validateName(opts.name ?? '')
  const scope = opts.scope ?? 'admin'

  if (!BACKEND_SCOPES.includes(scope)) {
    throw new Error(`Invalid --scope "${scope}". Use one of: ${BACKEND_SCOPES.join(', ')}.`)
  }

  return {
    name,
    scope,
    fields: parseFields(opts.fields ?? ''),
    backendDir: opts['backend-dir'] ?? `modules/${name}`,
    frontendDir: opts['frontend-dir'] ?? `features/${name}`,
    dryRun: Boolean(opts['dry-run']),
    register: Boolean(opts.register),
  }
}

/** Adds the backend module's import and `app.use` mount. Idempotent per mount path. */
export function appRegistrationPatch({ name, backendDir, scope }) {
  const Routes = `${toCamel(name)}Routes`
  const mount = apiBasePath(name, scope)
  const importLine = `import { ${Routes} } from './${backendDir}/routes/${name}.routes.js'\n`
  const useLine = `  app.use('${mount}', ${Routes})\n`

  return (source) => {
    if (source.includes(`app.use('${mount}'`)) {
      return { content: source, changed: false, reason: `${mount} already mounted` }
    }

    if (source.includes(Routes)) {
      throw new Error(`app.ts already references ${Routes} under a different mount; resolve manually.`)
    }

    const anchor = source.match(/^[ \t]*app\.use\(notFound\)/m)
    const top = source.search(TOP_LEVEL_CODE)
    if (!anchor || top === -1) {
      throw new Error('Could not find the notFound mount or import block in backend/app.ts.')
    }

    const withMount = source.replace(/^([ \t]*)app\.use\(notFound\)/m, (line, indent) => `${useLine}${indent}app.use(notFound)`)
    const insertAt = withMount.search(TOP_LEVEL_CODE)
    const content = `${withMount.slice(0, insertAt)}${importLine}${withMount.slice(insertAt)}`

    return { content, changed: true, reason: `mount ${mount}` }
  }
}

function planBackend(options, plan) {
  const moduleRoot = resolveDestination(BACKEND_ROOT, options.backendDir)
  for (const [relative, content] of Object.entries(backendFiles(options))) {
    plan.addFile(path.join(moduleRoot, relative), content)
  }

  if (options.register) {
    plan.addPatch(APP_FILE, appRegistrationPatch(options))
  }
}

function planFrontend(options, plan) {
  const featureRoot = resolveDestination(SRC_ROOT, options.frontendDir)
  for (const [relative, content] of Object.entries(frontendFiles(options))) {
    plan.addFile(path.join(featureRoot, relative), content)
  }
}

/** Next steps the generator cannot safely automate. Backend mounting is opt-in via --register. */
function guidance(mode, options) {
  const lines = []

  if (mode !== 'frontend') {
    if (options.register) {
      lines.push(
        options.dryRun
          ? `Backend: would be mounted at ${apiBasePath(options.name, options.scope)} in backend/app.ts (backup first).`
          : `Backend: mounted at ${apiBasePath(options.name, options.scope)} in backend/app.ts (backup written).`,
      )
    } else {
      lines.push(
        'Backend: not mounted yet. Add to backend/app.ts, or rerun with --register:',
        `  import { ${toCamel(options.name)}Routes } from './${options.backendDir}/routes/${options.name}.routes.js'`,
        `  app.use('${apiBasePath(options.name, options.scope)}', ${toCamel(options.name)}Routes)`,
      )
    }
  }

  if (mode !== 'backend') {
    const Pascal = toPascal(options.name)
    lines.push(
      `Frontend: generating a page does not register its route. Add it to src/app/routes/index.tsx manually:`,
      `  import { ${Pascal}Page } from '@/${options.frontendDir}/pages/${Pascal}Page'`,
      `  { path: '${options.name}', element: <${Pascal}Page /> }`,
    )
  }

  return lines.join('\n')
}

/**
 * @param {'backend'|'frontend'|'fullstack'} mode
 * @param {Record<string, string|boolean>} opts
 * @returns {{ exitCode: number, output: string, entries: object[] }}
 */
export function runGenerate(mode, opts) {
  const options = resolveOptions(opts)
  const plan = createPlan()

  if (mode === 'backend' || mode === 'fullstack') planBackend(options, plan)
  if (mode === 'frontend' || mode === 'fullstack') planFrontend(options, plan)

  const result = executePlan(plan, { dryRun: options.dryRun })
  const title = `${mode} generation: ${options.name}${options.dryRun ? ' (dry run)' : ''}`
  const output = [renderReport(title, result), guidance(mode, options)]

  return { exitCode: result.ok ? 0 : 1, output: output.join('\n'), entries: result.entries }
}
