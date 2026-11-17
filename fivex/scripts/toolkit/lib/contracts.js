/**
 * Static contract scanner. Reads backend mounts from backend/app.ts (following
 * nested router mounts), reads frontend `apiClient` calls from src/, and
 * compares them. Everything here is static analysis, so results are reported
 * as findings rather than proof.
 */
import fs from 'node:fs'
import path from 'node:path'
import { PROJECT_ROOT, listFiles } from '../../utils/file-system.js'

export const BACKEND_ROOT = path.join(PROJECT_ROOT, 'backend')
export const SRC_ROOT = path.join(PROJECT_ROOT, 'src')
const APP_FILE = path.join(BACKEND_ROOT, 'app.ts')
const MAX_DEPTH = 4

/** Maps imported identifiers to absolute file paths for one source file. */
function importMap(source, fromFile) {
  const map = new Map()
  const pattern = /import\s*\{([^}]+)\}\s*from\s*'(\.[^']+)'/g
  let match

  while ((match = pattern.exec(source))) {
    const target = path.resolve(path.dirname(fromFile), match[2].replace(/\.js$/, '.ts'))
    for (const part of match[1].split(',')) {
      const identifier = part.trim().split(/\s+as\s+/).pop()
      if (identifier) map.set(identifier, target)
    }
  }

  return map
}

/** Collapses a path into comparable segments: any `:param` matches any segment. */
export function normalizePath(value) {
  const withoutQuery = value.split('?')[0]
  const trimmed = withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, '') : withoutQuery

  return trimmed
    .split('/')
    .filter(Boolean)
    .map((segment) => (segment.startsWith(':') || segment.includes('${') ? ':p' : segment))
}

export function pathsMatch(left, right) {
  const a = normalizePath(left)
  const b = normalizePath(right)

  return a.length === b.length && a.every((segment, index) => segment === b[index] || segment === ':p' || b[index] === ':p')
}

/**
 * Scans backend/app.ts mounts, following `router.use('/x', child)` inside
 * mounted routers up to MAX_DEPTH levels.
 *
 * @returns {{ routes: Array<{method: string, path: string, file: string, guarded: boolean, mount: string}>, visitedFiles: Set<string> }}
 */
export function scanBackendRoutes(appFile = APP_FILE) {
  const routes = []
  const visitedFiles = new Set()

  function walk(file, prefix, depth, mount, parentGuarded = false) {
    if (depth > MAX_DEPTH || !fs.existsSync(file)) return
    visitedFiles.add(file)

    const source = fs.readFileSync(file, 'utf8')
    const imports = importMap(source, file)
    const guarded = parentGuarded || /authorize\(|authenticate/.test(source)
    const routePattern = /\.(get|post|put|patch|delete)\(\s*'([^']*)'/g
    let match

    while ((match = routePattern.exec(source))) {
      const fullPath = `${prefix}/${match[2]}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
      routes.push({ method: match[1].toUpperCase(), path: fullPath, file, guarded, mount })
    }

    const nestedPattern = /\.use\(\s*'([^']+)'\s*,\s*(\w+)\s*\)/g
    while ((match = nestedPattern.exec(source))) {
      const child = imports.get(match[2])
      if (child) walk(child, `${prefix}${match[1]}`, depth + 1, mount, guarded)
    }
  }

  const appSource = fs.readFileSync(appFile, 'utf8')
  const imports = importMap(appSource, appFile)
  const mountPattern = /app\.use\(\s*'([^']+)'\s*,\s*(\w+)\s*\)/g
  let match

  while ((match = mountPattern.exec(appSource))) {
    const child = imports.get(match[2])
    if (child) walk(child, match[1], 0, match[1])
  }

  return { routes, visitedFiles }
}

/** Resolves a frontend URL expression (template literal or `+` concatenation) using known constants. */
export function resolveUrlExpression(expression, constants) {
  const trimmed = expression.trim()

  if (trimmed.startsWith('`')) {
    return trimmed
      .slice(1, -1)
      .replace(/\$\{([^}]*)\}/g, (_match, inner) => constants.get(inner.trim()) ?? ':p')
  }

  return trimmed
    .split('+')
    .map((part) => {
      const token = part.trim()
      if (/^(['"]).*\1$/.test(token)) return token.slice(1, -1)
      return constants.get(token) ?? ':p'
    })
    .join('')
}

/**
 * Finds `apiClient.<method>(...)` calls under src/ whose URL starts with /api.
 * @returns {Array<{method: string, path: string, file: string}>}
 */
export function scanFrontendCalls(srcRoot = SRC_ROOT) {
  const calls = []
  const callPattern = /apiClient\.(get|post|put|patch|delete)\s*(?:<[^>]*>)?\(\s*([^,)]+)/g
  const constPattern = /const\s+(\w+)\s*=\s*'([^']*)'/g

  for (const file of listFiles(srcRoot, { extensions: ['.ts', '.tsx'] })) {
    if (/\.test\.|\.spec\./.test(file)) continue
    const source = fs.readFileSync(file, 'utf8')
    if (!source.includes('apiClient.')) continue

    const constants = new Map()
    let match
    while ((match = constPattern.exec(source))) constants.set(match[1], match[2])

    while ((match = callPattern.exec(source))) {
      const url = resolveUrlExpression(match[2], constants)
      if (url.startsWith('/api/')) {
        calls.push({ method: match[1].toUpperCase(), path: url, file })
      }
    }
  }

  return calls
}

/** Frontend calls with no matching backend route, and backend routes no frontend calls. */
export function compareContracts(backendRoutes, frontendCalls) {
  const unmatchedCalls = frontendCalls.filter(
    (call) => !backendRoutes.some((route) => route.method === call.method && pathsMatch(route.path, call.path)),
  )
  const unusedRoutes = backendRoutes.filter(
    (route) => !frontendCalls.some((call) => call.method === route.method && pathsMatch(route.path, call.path)),
  )

  return { unmatchedCalls, unusedRoutes }
}

/** Admin mounts whose router file has no authenticate/authorize guard. */
export function findPermissionGaps(backendRoutes) {
  const seen = new Set()
  const gaps = []

  for (const route of backendRoutes) {
    if (!route.path.startsWith('/api/admin') || route.guarded) continue
    const key = `${route.mount}|${route.file}`
    if (seen.has(key)) continue
    seen.add(key)
    gaps.push({ mount: route.mount, file: route.file })
  }

  return gaps
}

/** Route modules under backend/modules that are never reached from app.ts. */
export function findUnregisteredRouteModules(visitedFiles, backendRoot = BACKEND_ROOT) {
  const routeFiles = listFiles(path.join(backendRoot, 'modules'), { extensions: ['.ts'] }).filter((file) =>
    file.includes(`${path.sep}routes${path.sep}`),
  )

  return routeFiles
    .filter((file) => !visitedFiles.has(file))
    .map((file) => ({ file, exports: [...fs.readFileSync(file, 'utf8').matchAll(/export const (\w+Routes)\b/g)].map((m) => m[1]) }))
    .filter((entry) => entry.exports.length > 0)
}
